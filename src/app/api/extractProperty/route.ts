
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize the OpenAI client with your API key.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    // Expect a JSON payload with "text", "property", and optional "instructions"
    const { text, property, instructions } = await req.json();

    if (!text || !property) {
      return NextResponse.json(
        { error: "Missing required fields: 'text' and/or 'property'." },
        { status: 400 }
      );
    }

    let prompt = "";

    if (property === "brandDescription") {
      // Enhanced extraction for brandDescription: extract, enhance, create tagline and logo concept.
      prompt = `
Below is a text containing brand information. Your task is to extract the value for "brandDescription" from the text.
Then, enhance the extracted description to make it more compelling.
Next, generate a creative tagline based on the enhanced description.
Finally, if possible, generate a creative logo concept that incorporates the brand's name and primary colors (if available in the text).
If "brandDescription" is not found in the text, return the following value exactly:
"Enter valid data, I am unable to extract"
Return the output strictly in valid JSON format with the keys:
- brandDescription
- enhancedDescription
- tagline
- logoConcept

Text:
${text}
`;
    } else {
      // For any other property, simply extract its value with optional additional instructions.
      prompt = `
Below is a text containing brand information. Your task is to extract the value for "${property}" from the text.
${instructions ? "Additional instructions: " + instructions : ""}. If it is few words but makes sense to you as per the ${property} then keep the text.
If the property "${property}" is not found in the text, return the following value exactly:
"Enter valid data, I am unable to extract"
Return the output strictly in valid JSON format with the key "${property}".

Text:
${text}
`;
    }

    // Call ChatGPT (using gpt-3.5-turbo) to perform the extraction and enhancement.
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            property === "brandDescription"
              ? `You are an assistant that extracts and enhances brand descriptions. Return only valid JSON with the keys "brandDescription", "enhancedDescription", "tagline", and "logoConcept".`
              : `You are an assistant that extracts the "${property}" from the given text and correct the english if it wrong. Return only valid JSON with the key "${property}".`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
    });

    // Extract and trim the returned content.
    let extractedJSON = response.choices[0]?.message?.content?.trim() || "";

    // Remove markdown code fences if present.
    if (extractedJSON.startsWith("```json")) {
      extractedJSON = extractedJSON.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    }

    // Attempt to parse the extracted JSON.
    let parsedData;
    try {
      parsedData = JSON.parse(extractedJSON);
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to parse extracted JSON", raw: extractedJSON,e:err },
        { status: 500 },
      );
    }

    // For non-brandDescription extractions, ensure the property value is set.
    if (property !== "brandDescription") {
      if (!parsedData[property] || parsedData[property].trim() === "") {
        parsedData[property] = "Enter valid data, I am unable to extract";
      }
    } else {
      // For brandDescription, ensure all expected keys are present.
      if (!parsedData.brandDescription || parsedData.brandDescription.trim() === "") {
        parsedData.brandDescription = "Enter valid data, I am unable to extract";
      }
      if (!parsedData.enhancedDescription) parsedData.enhancedDescription = "";
      if (!parsedData.tagline) parsedData.tagline = "";
      if (!parsedData.logoConcept) parsedData.logoConcept = "";
    }

    return NextResponse.json({ result: parsedData });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json({ error: "Failed to extract and enhance property information." }, { status: 500 });
  }
}
