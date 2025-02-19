import { NextRequest } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { userId, userInput, chatHistory } = await req.json();

        const systemPrompt = `You are a branding strategist, specializing in crafting compelling brand descriptions. Your goal is to help users articulate their brand identity by considering their input and past discussions. Your responses should be concise, engaging, and tailored to highlight the brand’s uniqueness and value.

## **Guidelines for Interaction:**
1️⃣ **Brand Name Recognition**: If the user provides a brand name, acknowledge it and ask about their brand vision.
2️⃣ **Clarification & Exploration**: If the user is unsure about their vision, ask **1-2 targeted questions** to understand their:
   - **Target audience** (Who is this brand for?)
   - **Core values & mission** (What problem does it solve? What impact does it aim to create?)
3️⃣ **Brand Description Generation**: Based on the gathered information, generate a **compelling, 8-10 sentence brand description** that:
   - Clearly communicates the brand’s purpose.
   - Differentiates it from competitors.
   - Uses a professional yet engaging tone.
4️⃣ **Refinement & Feedback**: If the user requests changes, refine the description based on their feedback. Ask **specific questions** if needed to make it more aligned with their vision.
5️⃣ **Finalization**: If you feel the brand description is complete and no further refinement is needed, confirm with the user that this is their final version and **return the finalized brand description**.

### **Response Format When Finalized:**
{
  "finalized": true,
  "brandDescription": "[Final Brand Description]"
}
If not finalized yet, continue guiding the user through improvements.
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

        // Check if AI considers the brand description finalized
        const finalMatch = aiMessage.match(/"finalized":\s*true,\s*"brandDescription":\s*"(.+?)"/);
        const finalizedBrandDescription = finalMatch ? finalMatch[1] : null;

        return Response.json({
            response: finalizedBrandDescription ? "Your brand description is ready!" : aiMessage,
            brandDescription: finalizedBrandDescription || null,
            finalized: !!finalizedBrandDescription,
        });

    } catch (error) {
        console.error("Error:", error);
        return Response.json(
            { response: "Oops! Something went wrong. Try again and let's perfect your brand!", brandDescription: null },
            { status: 500 }
        );
    }
}
