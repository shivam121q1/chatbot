import { NextRequest } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { userId, userInput, chatHistory } = await req.json();

        // Step 1: Ask branding questions & refine based on conversation
        const chatResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a branding expert helping users create a unique brand name. 
                    Your goal is to guide users efficiently and intuitively. keep your responses decent and engaging.
                    Follow this process:
                    
                    1 If the user provides a brand name directly, acknowledge and confirm it.
                    2  If you get a known brand name in the response, confirm it with the user. Once user confirms, finalize it and respond with:
                        {
                          "brandName": "Finalized Name"
                        }
                    3 If unsure or requesting suggestions, ask **2-3 short, insightful branding questions** (max 10-12 words per question).
                    4 Based on their responses, suggest **3 strong brand names**.
                    5 If they like one, finalize it
                    6 If unsure, suggest alternatives until they confirm satisfaction.
                    7 When they express strong interest in a name, finalize it and respond with:
                        {
                          "brandName": "Finalized Name"
                        }
                    
                    Example 1:
                    User: "I am bmw."
                    AI: "Welcome BMW"
                         {"brandName": "BMW"}"
                     
                    Example 2:
                    User: "I want a modern tech brand."
                    AI: "Would you prefer a futuristic or simple name?"
                    User: "Futuristic."
                    AI: "Great! Here are some futuristic name ideas:
                         - TechNova
                         - ByteForge
                         - NeuralEdge
                         Which one do you like best?"
                    User: "I like TechNova."
                    AI: "Awesome! Finalizing your brand name:
                         {"brandName": "TechNova"}"
                    `
                },
                ...chatHistory.map((msg:any) => ({
                    role: msg.sender === "user" ? "user" : "assistant",
                    content: msg.text,
                })),
                { role: "user", content: userInput },
            ],
        });

        const aiMessage = chatResponse.choices[0]?.message?.content?.trim() || "";

        // Extract finalized brand name if confirmed
        const brandMatch = aiMessage.match(/"brandName":\s*"(.+?)"/);
        const refinedBrandName = brandMatch ? brandMatch[1] : null;

        return Response.json({
            response: refinedBrandName
                ? ` Your perfect brand name is ${refinedBrandName}!  It's unique, powerful, and ready for success.`
                : `${aiMessage} `,
            brandName: refinedBrandName || null,
            finalized: !!refinedBrandName,
        });

    } catch (error) {
        console.error("Error:", error);
        return Response.json({ response: "Oops! Something went wrong. Try again and let's find your perfect brand name! ", brandName: null }, { status: 500 });
    }
}
