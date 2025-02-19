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
     I am starting a telecom provider company and want to provide 4 subscription flavours, $20/m for 3GB, $25/m for 5GB, $30/m for 30GB+, $40 for 50GB+. I want you to give me 4 titles for these flavours that are aligned to my brand ${brandName}} which describes as ${brandDescription}and return these titles in a string array
 in json as subscription Titles of two words    `;

        // Call OpenAI to process the prompt
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
                }
            ]
        });

        const responseText = completion.choices[0].message.content;

        // Remove markdown code fences (```) if present
        const cleanResponseText = responseText?.replace(/^```json\s*/g, "").replace(/\s*```$/g, "");

        // Attempt to parse the cleaned response JSON
        let parsedData;
        try {
            if (!cleanResponseText) {
                throw new Error("Response text is undefined");
            }
            parsedData = JSON.parse(cleanResponseText);
        } catch (err) {
            return NextResponse.json(
                { error: "Failed to parse the extracted JSON response", raw: cleanResponseText,e:err },
                { status: 500 }
            );
        }

        // Return the extracted subscription titles in JSON format
        return NextResponse.json({
            subscriptionTitles: parsedData,
        });
    } catch (error) {
        console.error("Error generating subscription titles:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
