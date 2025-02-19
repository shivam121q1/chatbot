import axios from "axios";
import { NextRequest } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { brandName = "", brandDescription = "" } = await req.json();

        if (!brandName.trim()) {
            return Response.json({ response: "Brand name is required." }, { status: 400 });
        }

        // Step 1: Check if the brand name is popular
        const brandCheckResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an AI that determines if a brand name is widely recognized or not.
                    Respond with "Yes" if the brand name is popular brand.
                    Respond with "No" if the brand name is not popular.`
                },
                { role: "user", content: `Brand Name: ${brandName}` },
            ],
        });

        const aiMessage = brandCheckResponse.choices[0]?.message?.content?.trim() || "";
        console.log(aiMessage)
        let searchWord = ""
        if (aiMessage.toLowerCase() === "no") {
             // Step 2: Determine the industry if brand name is not popular
        const industryResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an AI that analyzes a brand description and determines the industry it belongs to.
                    Provide one keyword that define the industry just give the word .`
                },
                { role: "user", content: `Brand Description: ${brandDescription}` },
            ],
        });
        const industryKeywords = industryResponse.choices[0]?.message?.content?.trim() || "Unknown Industry";
        console.log("words",industryKeywords); 
        searchWord= industryKeywords.trim()
        

        }else{
            searchWord=brandName;
        }
         searchWord = searchWord.trim()
         function removeCircularReferences(obj: any) {
            const seen = new Set();
            return JSON.parse(JSON.stringify(obj, (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    if (seen.has(value)) {
                        return;
                    }
                    seen.add(value);
                }
                return value;
            }));
        }
        
        try {
            console.log( "api word",searchWord)
            const response = await axios.get(`https://api.unsplash.com/search/photos?per_page=2&client_id=aGyXb1MWqLJG5LRKnhuLNkEWCoNmR-79I5mMX2pTGsU&query=${searchWord}\ header\ image`);
            
            // Extract just the data from the response to avoid circular structure
            const cleanData = removeCircularReferences(response.data);
        
            return Response.json(cleanData);
        } catch (error) {
            console.error("Error details:", error);
           
        }
        
    } catch (error) {
        console.error("Error:", error);
        return Response.json({ response: "Oops! Something went wrong. Try again and let's determine your brand's industry!" }, { status: 500 });
    }
}
