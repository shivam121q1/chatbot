import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize the OpenAI client with your API key.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    // Extract the brand details from the request
    const { brandName, brandDescription } = await req.json();

    if (!brandName || !brandDescription) {
      return NextResponse.json(
        { error: "Missing required fields: 'brandName' and/or 'brandDescription'." },
        { status: 400 }
      );
    }

    // Construct a dynamic prompt based on the input
    const prompt = `
      I am starting a telecom provider company and want to provide 4 subscription flavors:
      - $20/m for 3GB
      - $25/m for 5GB
      - $30/m for 30GB+
      - $40 for 50GB+ 
      
      Give me 4 titles for these plans that align with my brand '${brandName}', which describes as '${brandDescription}'. 
      Return the titles in a plain JSON string array (e.g., ["Basic Connect", "Smart Saver", "Unlimited Freedom", "Ultra Plan"]).`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert in branding and creative writing. Generate subscription plan titles based on the brand's identity and description.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    let responseText = completion.choices[0]?.message?.content?.trim();
    if (!responseText) {
      return NextResponse.json({ error: "Empty response from OpenAI" }, { status: 500 });
    }

    // Check if the response is already a simple array
    try {
      const parsedData = JSON.parse(responseText);
      if (Array.isArray(parsedData)) {
        return NextResponse.json({ subscriptionTitles: parsedData });
      }
    } catch (err) {
      // Continue processing if JSON parsing fails
    }

    // Clean up unwanted formatting like Markdown code fences
    responseText = responseText.replace(/^```json\s*|```$/g, "").trim();

    // Attempt to parse the cleaned response
    try {
      const parsedData = JSON.parse(responseText);
      if (Array.isArray(parsedData)) {
        return NextResponse.json({ subscriptionTitles: parsedData });
      }
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to parse JSON response", rawResponse: responseText },
        { status: 500 }
      );
    }

    // If everything fails, return raw text
    return NextResponse.json({ error: "Unexpected response format", rawResponse: responseText }, { status: 500 });
  } catch (error) {
    console.error("Error generating subscription titles:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
