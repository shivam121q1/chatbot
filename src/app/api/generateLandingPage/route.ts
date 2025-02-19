import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { brandName, brandDescription, keywords, targetAudience } = await req.json();

    if (!brandName || !brandDescription || !keywords || !targetAudience) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a brand strategist and copywriting expert. Generate a compelling brand description (4 lines) and a catchy tagline.",
        },
        {
          role: "user",
          content: `
          Generate a refined 4-line business description and a catchy tagline based on:
          - Brand Name: ${brandName}
          - Original Description: ${brandDescription}
          - Keywords: ${keywords}
          - Target Audience: ${targetAudience}
          
          Ensure the description is engaging, clear, and highlights the brand’s value. 
          The tagline should be short, powerful, and memorable.
          
          Return the output in this format:
          {
            "brandName": "${brandName}",
            "keywords": "${keywords}",
            "audience": "${targetAudience}",
            "description": "Your improved 4-line brand description here.",
            "tagline": "Your catchy tagline here."
          }
          `,
        },
      ],
      max_tokens: 250,
    });

    const generatedText = response.choices[0]?.message?.content || "";
    const generatedData = JSON.parse(generatedText);

    return NextResponse.json(generatedData);
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json({ error: "Failed to generate description and tagline." }, { status: 500 });
  }
}
