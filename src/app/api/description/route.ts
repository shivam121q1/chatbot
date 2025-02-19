import { NextRequest } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { userId, userInput, chatHistory } = await req.json();

        const systemPrompt = `You are a branding strategist helping users craft a compelling brand description by considering previous brand discussions. Your goal is to create a concise, engaging, and impactful brand description based on the user's brand name and vision.

Follow this process:
1️⃣ If the user provides a brand name, acknowledge it and ask about their brand vision.
2️⃣ If they are unsure, ask 1-2 short questions to understand their target audience and values.
3️⃣ Generate a concise 8-10 sentence brand description that highlights its uniqueness and value in a professional yet engaging tone.
4️⃣ If they request refinements, adjust the description accordingly based on their feedback.
5️⃣ When they express satisfaction, finalize it and respond with:
            Example:
            {
            "brandDescription": "[Brand Name] is redefining connectivity with cutting-edge solutions designed for the modern world. Built on a foundation of innovation, speed, and reliability, we empower individuals and businesses to stay effortlessly connected. Our seamless technology ensures uninterrupted communication, whether you’re at home, at work, or on the move. With a commitment to exceptional service and customer-first experiences, we don’t just connect people—we bring them closer. From blazing-fast networks to flexible plans tailored for your needs, [Brand Name] is your gateway to a smarter, more connected future."
            }
                    
        `;

        const chatResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                ...chatHistory.map((msg: any) => ({
                    role: msg.sender === "user" ? "user" : "assistant",
                    content: msg.text,
                })),
                { role: "user", content: userInput },
            ],
        });

        const aiMessage = chatResponse.choices[0]?.message?.content?.trim() || "";

        // Extract finalized brand description if confirmed
        const brandDescriptionMatch = aiMessage.match(/"brandDescription":\s*"(.+?)"/);
        const refinedBrandDescription = brandDescriptionMatch ? brandDescriptionMatch[1] : null;

        return Response.json({
            response: refinedBrandDescription
                ? ` Your brand description: **${refinedBrandDescription}**`
                : `${aiMessage} `,
            brandDescription: refinedBrandDescription || null,
            finalized: !!refinedBrandDescription,
        });

    } catch (error) {
        console.error("Error:", error);
        return Response.json({ response: "Oops! Something went wrong. Try again and let's perfect your brand! ", brandDescription: null }, { status: 500 });
    }
}
