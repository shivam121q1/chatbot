"use client";
import "regenerator-runtime/runtime";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic, X } from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import ChooseColorPage from "./Logo";

type Step = {
  question: string;
  property: string;
  instructions: string;
};

const steps: Step[] = [
  {
    question: "What is your brand name?",
    property: "brandName",
    instructions: "Extract only the name of the brand.",
  },
  {
    question: "Describe your brand in a few sentences.",
    property: "description",
    instructions: "Extract the brand description.",
  },
 
];

const fallbackMessage = "Enter valid data, I am unable to extract";

interface ChatbotProps {
  onComplete: (responses: Record<string, string>) => void;
}


interface Responses {
  [key: string]: string;
}

interface Message {
  text: string;
  sender: "user" | "bot";
}



export default function Chatbot({ onComplete }: ChatbotProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [responses, setResponses] = useState<Responses>({});
  const [isInteracting, setIsInteracting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [brandName, setBrandName] = useState("");
  const [description,setDescription] = useState("");

  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  

  const [isClient, setIsClient] = useState(false); // Track if component is mounted on the client

  useEffect(() => {
    setIsClient(true); // Set isClient to true after mounting on the client
  }, []);

  const speak = useCallback(
    async (text: string) => {
      setIsInteracting(true); // Disable interaction while speaking
  
      try {
        // Call the API to generate speech (your /api/audio endpoint)
        const response = await fetch("/api/audio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });
  
        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
  
          // Play the audio when it's ready
          audio.onplay = () => setIsInteracting(true); // Lock interaction when audio plays
          audio.onended = () => {
            setIsInteracting(false); // Unlock interaction when audio finishes
            startListening(); // Optionally start listening again after the speech ends
          };
  
          audio.play(); // Start playing the generated audio
        } else {
          throw new Error("Failed to generate speech from API");
        }
      } catch (error) {
        console.error("Error generating speech:", error);
        setIsInteracting(false); // Unlock interaction if there was an error
      }
    },
    []
  );
  

  useEffect(() => {
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      console.warn("Browser does not support speech recognition.");
      return;
    }

    if (steps.length > 0 && isClient) {
      // Only run when mounted on the client side
      speak(steps[0].question);
      setMessages([{  text: steps[0].question,sender:"bot" }]);
    }
  }, [speak, isClient]);

  useEffect(() => {
    if (!listening && transcript) {
      handleAnswer(transcript);
    }
  }, [transcript, listening]);
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const handleAnswer = async (answer: string) => {
    if (!answer.trim()) return;
    setIsValidating(true);
   console.log(messages)
    const { property, instructions, question } = steps[currentStep];
    const newMessages: Message[] = [...messages, { text: answer, sender: "user" }];
    setMessages(newMessages);
    try {
      const res = await fetch(`/api/${property}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput:answer,chatHistory:newMessages }),
      });

      const data = await res.json();
      setMessages([...newMessages, { text: data.response, sender: "bot" }]);
      speak(data.response);
      if(data?.brandName){
         await delay(6000);
         setBrandName(data?.brandName);
        if (currentStep < steps.length - 1) {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          speak(steps[nextStep].question);
          // you are till reaching the 
          setMessages((prev) => [
            ...prev,
            { type: "bot", text: steps[nextStep].question  ,sender: "bot", },
          ]);
        } else{
          setIsInteracting(false);

        }
        
      }else if(data?.brandDescription){
        setDescription(data?.brandDescription);
          console.log("Calling brandAnalysis API...");
          console.log(brandName,data?.brandDescription)
        await submitToAPI(brandName,data?.brandDescription);
       

        setIsInteracting(false);
      }
      

     

      

      // const updatedResponses = { ...responses, [property]: validatedValue };
      // setResponses(updatedResponses);

      // After the description, call the brandAnalysis API if it's the brand description
      if (property === "brandDescription") {
        // console.log("Calling brandAnalysis API...");
        // await submitToAPI(updatedResponses);
       
        // speak(steps[nextStep].question);
        // setMessages((prev) => [
        //   ...prev,
        //   { text: steps[nextStep].question ,sender: "bot", },
        // ]);
      } else {
        // Move to the next step
      
      }

      resetTranscript(); // Clear transcript for next input
    } catch (error) {
      console.error("Validation error:", error);
      setIsValidating(false);
    }
  };
 const submitToAPI = async (brandName: string, description: string): Promise<void> => {
  const data = {
    brandName: brandName,
    brandDescription: description,
  };

  try {
    console.log(data);

    // First API call for brand analysis
    const brandRes = await fetch("/api/brandDescription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!brandRes.ok) {
      console.error("Failed to submit brand analysis", brandRes.status);
      return;
    }

    const brandResult = await brandRes.json();
    console.log("Brand analysis result:", brandResult);

    // Second API call for image generation
    const IamgeRes = await fetch("/api/generateImages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!IamgeRes.ok) {
      console.error("Failed to generate images", IamgeRes.status);
      return;
    }

    const imageResult = await IamgeRes.json(); // Store the result from image generation if needed
    console.log("Image generation result:", imageResult);

    // Third API call for image and text combination
    const TextLower = await fetch("/api/imageandText", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });


    if (!TextLower.ok) {
      console.error("Failed to combine image and text", TextLower.status);
      return;
    }

    const imageTextResult = await TextLower.json(); // Store the result of image and text
    console.log("Image and text result:", imageTextResult);
    const cleanResponse = JSON.parse(imageTextResult.response);
    console.log(cleanResponse)

    // Fourth API call for plan generation
    const plansRes = await fetch("/api/planGenerator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!plansRes.ok) {
      console.error("Failed to generate plans", plansRes.status);
      return;
    }

    const subPlans = await plansRes.json();
    console.log("Plans generation result:", subPlans);

    // Combine all the results into one object and store in state
    setResponses((prev) => {
      const finalData = {
        ...prev,
        brandResult,     // Store brandResult
        subPlans,        // Store subPlans
        imageResult,     // Optionally store image result
        cleanResponse, // Optionally store image + text result
      };
      return finalData;
    });

  } catch (error) {
    console.error("Error during brand analysis submission:", error);
    setMessages((prev) => [
      ...prev,
      { text: "Error submitting data", sender: "bot" },
    ]);
  }
};

  const startListening = () => {
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      alert("Speech Recognition is not supported in your browser.");
      return;
    }
    setIsInteracting(true);
    SpeechRecognition.startListening({ continuous: false, language: "en-US" });
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col relative">
      <main
        className={`flex-1 overflow-y-auto p-4 space-y-3 transition-all duration-500 ${
          isInteracting
            ? "opacity-50 backdrop-blur-md pointer-events-none"
            : "opacity-100"
        }`}
      >
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-xl max-w-[80%] ${
                msg.sender === "bot"
                  ? "bg-white text-black self-start text-left"
                  : "bg-gray-200 text-black self-end text-right ml-auto"
              }`}
            >
              {msg.text}
            </motion.div>
          ))}
          {!isInteracting && currentStep === steps.length - 1 && (
            <div className="flex justify-center">

            <ChooseColorPage brandName={brandName} setResponse={setResponses}/>
            <button  onClick={()=>{onComplete(responses)}}>Finish</button>
            {isValidating}
            </div>
          )}
        </AnimatePresence>
      </main>

      {isInteracting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10">
          {brandName }
          <motion.div
            className="w-32 h-32 bg-white rounded-full opacity-50"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          />
          {transcript}
          <p className="text-white text-lg mt-4">
            {listening ? "Listening..." : "Tap to Start Mic"}
          </p>
          {description}
          {!listening && (
            <Button
              onClick={startListening}
              className="w-16 h-16 flex items-center justify-center bg-white text-black rounded-full mt-4"
            >
              <Mic className="w-8 h-8" />
            </Button>
          )}
          <Button
            onClick={() => setIsInteracting(false)}
            className="absolute top-4 right-4 bg-red-500 text-white rounded-full"
          >
            <X size={24} />
          </Button>
        </div>
      )}

      {!isInteracting && (
        <footer className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
          <Button
            onClick={startListening}
            className="w-16 h-16 flex items-center justify-center bg-white text-black rounded-full"
          >
            <Mic className="w-8 h-8" />
          </Button>
          <p className="text-center text-gray-400 mt-2 text-sm">Tap to Speak</p>
        </footer>
      )}
    </div>
  );
}
