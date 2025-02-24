import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to delay requests
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    const { brandName, brandDescription } = await req.json();

    if (!brandName || !brandDescription) {
      return NextResponse.json({ error: "brandName and brandDescription are required" }, { status: 400 });
    }

    // Define image prompts
    const prompts = [
      `A professional and inviting hero section image for ${brandName}, an MVNO provider. The image should showcase affordability, seamless mobile connectivity, and customer trust. No futuristic effects or abstract visuals.`,
      `A realistic image representing strong network coverage for ${brandName}. Show people using mobile phones in different locations—urban, suburban, and rural—to emphasize reliable connectivity.`,
      `A welcoming image for phone compatibility, showing people happily using their own phones after switching to ${brandName}. Emphasize an easy transition and keeping their number.`,
    ];

    let imageUrls: (string | null)[] = [];

    // Generate images one by one with a delay to prevent rate limit issues
    for (const prompt of prompts) {
      try {
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
        });

        imageUrls.push(response.data[0]?.url || null);
      } catch (error) {
        console.error("Error generating image:", error);
        imageUrls.push(null); // Push null if the request fails
      }

      // Delay 12 seconds between requests to stay within OpenAI's rate limit (5/min)
      await delay(12000);
    }

    // Check if all images were successfully generated
    if (imageUrls.some((url) => !url)) {
      return NextResponse.json({ error: "Some images failed to generate due to rate limits." }, { status: 429 });
    }

    return NextResponse.json({
      heroImage: imageUrls[0],
      highlightImages: {
        coverageImage: imageUrls[1],
        phoneCompatibilityImage: imageUrls[2],
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
