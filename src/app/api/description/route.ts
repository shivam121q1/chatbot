import { NextRequest } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { userId, userInput, chatHistory } = await req.json();

        const systemPrompt = `You are a branding strategist specializing in concise and compelling brand descriptions. 
Your task is to help users quickly define their brand identity and finalize it in a structured format.

### Interaction Flow:
1️⃣ **Check for a Valid Brand Description**
If the user provides a clear and meaningful brand one liner, immediately return the response by generating 4-5 sentences as brand description in this format:
  {"finalized": true, "brandDescription": "[Final Brand Description]"}
If the description is unclear, incomplete, or missing, move to step 2.

2️⃣ **Guided Refinement (Only If Needed)**
If the user is unsure or gives a vague response, ask **only one** of these:
  - "What makes your brand stand out?"
  - "Who is your main audience?"

3️⃣ **Confirm Key Points (Before Generating Full Description)**
Summarize the user’s choices in a short sentence:
  "Got it! Your brand focuses on [Core Value] for [Target Audience]. Does that sound right?"
If the user agrees, proceed to step 4.

4️⃣ **Finalize & Return JSON Response**
Once confirmed, generate a **concise and engaging brand description** (5-6 sentences).
Do **not read the full description aloud**. Instead, return it in this format:
  {"finalized": true, "brandDescription": "[Final Brand Description]"}
If the user requests refinements, adjust accordingly and confirm again.
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
