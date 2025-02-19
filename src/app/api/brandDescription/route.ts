import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize the OpenAI client with your API key.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    // Expect a JSON payload with "brandName" and "brandDescription"
    const { brandName, brandDescription } = await req.json();

    if (!brandName || !brandDescription) {
      return NextResponse.json(
        { error: "Missing required fields: 'brandName' and/or 'brandDescription'." },
        { status: 400 }
      );
    }

    // Updated prompt to avoid using "telecom provider"
    const prompt = `Based on the brand name '${brandName}' and the following brand description, generate:
    
    1. A one-liner tagline that captures the brand's identity and value in a catchy and concise way. Avoid directly stating 'telecom provider' but keep it relevant.
    2. A list of keywords (separated by commas) that highlight the brand's core themes, services, and unique offerings.
    3. If available, the official website URL for '${brandName}'. If multiple results exist, choose the most recognized domain.

    If any field cannot be determined, return:
    - "Enter valid data, I am unable to extract" for missing tagline or website.

    Return the output in JSON format:
    {
      "tagline": "string",
      "keywords": "string",
      "websiteUrl": "string"
    }

    Brand Description:
    ${brandDescription}
    `;

    // Call OpenAI to process the prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that extracts keywords and generates a tagline based on the given text. Do not use 'telecom provider' explicitly. Return output in JSON format with the keys: 'tagline', 'keywords', and 'websiteUrl'.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    let responseText = completion.choices[0]?.message?.content;
  
    if (!responseText) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    // Clean response if wrapped in markdown code fences (```json)
    if (responseText.startsWith("```json")) {
      responseText = responseText.replace(/^```json\s*/g, "").replace(/\s*```$/g, "");
    }

    // Attempt to parse the cleaned JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error);
      return NextResponse.json(
        { error: "Failed to parse the extracted JSON response", raw: responseText },
        { status: 500 }
      );
    }

    // Ensure all expected fields are present
    parsedData.tagline = parsedData.tagline?.trim() || "Enter valid data, I am unable to extract";
    parsedData.keywords = parsedData.keywords?.trim() || "Enter valid data, I am unable to extract";
    parsedData.websiteUrl =
      parsedData.websiteUrl?.trim() ||
      `https://www.${brandName.replace(/\s+/g, "").toLowerCase()}.com`;

    // Return only required fields
    return NextResponse.json({
      result: {
        brandName:brandName,
        brandDescription:brandDescription,
        tagline: parsedData.tagline,
        keywords: parsedData.keywords,
        websiteUrl: parsedData.websiteUrl,
      },
    });
  } catch (error) {
    console.error("Error processing brand details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
