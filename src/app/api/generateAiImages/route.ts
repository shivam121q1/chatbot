import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { brandDescription } = await req.json();

    if (!brandDescription) {
      return NextResponse.json({ error: "brandDescription is required" }, { status: 400 });
    }

    // Generate a detailed prompt for DALL·E
    const prompt = `A modern and professional banner image for a company. The theme should represent: ${brandDescription}. The style should be clean, high-tech, and visually appealing.`;

    // Call OpenAI DALL·E API
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    // Get the image URL
    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
    }

    return NextResponse.json({ imageUrl }, { status: 200 });

  } catch (error) {
    console.log(error)
    return NextResponse.json( { status: 500 });
  }
}
