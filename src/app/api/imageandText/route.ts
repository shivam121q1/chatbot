import { NextRequest } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { brandName, brandDescription } = await req.json();

        // Step 1: Generate marketing content
        const chatResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a marketing expert generating promotional content for a brand.
                    Your task is to create structured marketing text for two sections: Coverage and Phone Compatibility.
                    Ensure the content aligns with the brand’s identity and value proposition while staying within character limits.
                    
                    Brand Information:
                    Brand Name: ${brandName}
                    Description: ${brandDescription}
                    
                    Format your response in json fomrat as follows:
                    
                    Coverage Section:
                    Title: Craft a compelling headline emphasizing the brand’s coverage, connectivity, or reliability..( Give Max 60 characters }
                    Subtitle: Provide a short, engaging description highlighting seamless service, accessibility, and coverage benefits.(Max 120 characters)
                    
                    Phone Compatibility Sectio:
                    Title:  Create a persuasive and inviting headline that encourages users to bring their existing devices.( Give Max 60 characters)
                    Subtitle:  Write a brief explanation reassuring users they can switch easily while keeping their phone and number.(Max 120 characters)
                    
                    Example json Output for "Flight Mobile":
                    {
                    Coverage Section:{
                    Title: Unbeatable 4G and 5G coverage across America 
                    Subtitle: Stay connected with seamless coast-to-coast service no matter where you are.
                      } 
                    Phone Compatibility Section:{   
                    Title: Love your phone and digits? Bring 'em along! 
                    Subtitle: Your number and phone can make the switch to Flight Mobile too. Let's make sure your device is unlocked and network-compatible.}
                }`
                },
                { role: "user", content: `Brand Name: ${brandName}\nDescription: ${brandDescription}` },
            ],
        });

        const aiMessage = chatResponse.choices[0]?.message?.content?.trim() || "";
         console.log(aiMessage)
        return Response.json({
            response: aiMessage,
        });
    } catch (error) {
        console.error("Error:", error);
        return Response.json({ response: "Oops! Something went wrong. Try again and let's craft your brand's perfect marketing content!" }, { status: 500 });
    }
}
