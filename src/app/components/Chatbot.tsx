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
    question: "Welcome. We will be creating your MVNO Site .To Start Please Tell Your Brand Name",
    property: "brandName",
    instructions: "Extract only the name of the brand.",
  },
  {
    question: "Tell us a bit about your brand.",
    property: "description",
    instructions: "Extract the brand description.",
  },
];

const fallbackMessage = "Enter valid data, I am unable to extract";

interface ChatbotProps {
  onComplete: (responses: Record<string, string>) => void;
}

interface Responses {
  brandResult?: string;
  coverImage?: string;
  aiGeneratedImage?: string;
  highlightSections?: Record<string, any>;
  subscriptionPlans?: Record<string, any>;
  [key: string]: any;
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
  const [description, setDescription] = useState("");
  const [loader, setLoader] = useState(false);
  const [startButton, setStartButton] = useState(false);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isClient, setIsClient] = useState(false); // Track if component is mounted on the client

  useEffect(() => {
    setIsClient(true); // Set isClient to true after mounting on the client
  }, []);
  
  const getRandomNumber = () => Math.floor(Math.random() * 7);
  

  // const speak = useCallback(async (text: string) => {
    
  //   setIsInteracting(true); // Disable interaction while speaking

  //   try {
  //     // Call the API to generate speech (your /api/audio endpoint)
  //     const response = await fetch("/api/audio", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ text }),
  //     });

  //     if (response.ok) {
  //       const audioBlob = await response.blob();
  //       const audioUrl = URL.createObjectURL(audioBlob);
  //       const audio = new Audio(audioUrl);

  //       // Play the audio when it's ready
  //       audio.onplay = () => setIsInteracting(true); // Lock interaction when audio plays
  //       audio.onended = () => {
  //         setIsInteracting(false); // Unlock interaction when audio finishes
  //         if (steps.length - 1 !== currentStep) {
  //           startListening(); // Optionally start listening again after the speech ends
  //         }
  //       };

  //       audio.play(); // Start playing the generated audio
  //     } else {
  //       throw new Error("Failed to generate speech from API");
  //     }
  //   } catch (error) {
  //     console.error("Error generating speech:", error);
  //     setIsInteracting(false); // Unlock interaction if there was an error
  //   }
  // }, []);
  const waitUntilPlaying = async () => {
    return new Promise<void>((resolve) => {
      const checkPlaying = () => {
        if (isPlaying) {
          resolve(); // Resolve the promise when isPlaying is true
        } else {
          requestAnimationFrame(checkPlaying); // Keep checking
        }
      };
      checkPlaying(); // Start checking
    });
  };
  
  const speak = useCallback(async (text: string) => {
    setIsInteracting(true); // Disable interaction while speaking
  
    try {
     // Select a random API key
      const VOICE_ID = "iP95p4xoKVk53GoZ742B"; // Replace with a valid voice ID from Eleven Labs
  
      // Call Eleven Labs API via the backend
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "xi-api-key": "sk_3ddf30a5cb97b698dcb9cbfc2817306290658c9731875f71",
              },
              body: JSON.stringify({
                text: text,
                voice_settings: {
                  stability: 0.5,
                  similarity_boost: 0.5,
                },
              }),
            });
  
      if (!response.ok) throw new Error("Failed to generate speech from API");
  
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
  
      // Handle playback
      audio.onplay = () => setIsInteracting(true); // Lock interaction when audio plays
      audio.onended = () => {
        setIsInteracting(false); // Unlock interaction when audio finishes
        if (steps.length - 1 !== currentStep) {
          startListening(); // Resume listening after speech ends
        }
      };
  
      audio.play(); // Start playing the generated audio
    } catch (error) {
      console.error("Error generating speech:", error);
      setIsInteracting(false); // Unlock interaction if an error occurs
    }
  }, []);
  // const speak = useCallback(async (text: string) => {
  //   setIsInteracting(true); // Disable interaction while speaking
  
  //   try {
  //     const number = getRandomNumber();
  //     console.log(apiKeys);
  //     const API_KEY = apiKeys[number]; // Select a random API key
  //     const VOICE_ID = "iP95p4xoKVk53GoZ742B"; // Replace with a valid voice ID from Eleven Labs
  
  //     // Call Eleven Labs API via the backend
  //     const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "xi-api-key": API_KEY,
  //       },
  //       body: JSON.stringify({
  //         text: text,
  //         voice_settings: {
  //           stability: 0.5,
  //           similarity_boost: 0.5,
  //         },
  //       }),
  //     });
  
  //     if (!response.ok) throw new Error("Failed to generate speech from API");
  
  //     const audioBlob = await response.blob();
  //     const audioUrl = URL.createObjectURL(audioBlob);
  //     const audio = new Audio(audioUrl);
  
  //     // Handle playback
  //     audio.onplay = () => {
  //       setIsInteracting(true); // Lock interaction when audio plays
  //       setIsPlaying(true); // Set playing state to true
  //     };
  
  //     audio.onended = () => {
  //       setIsInteracting(false); // Unlock interaction when audio finishes
  //       setIsPlaying(false); // Set playing state to false
  
  //       if (steps.length - 1 !== currentStep) {
  //         startListening(); // Resume listening after speech ends
  //       }
  //     };
  
  //     audio.play(); // Start playing the generated audio
  //   } catch (error) {
  //     console.error("Error generating speech:", error);
  //     setIsInteracting(false); // Unlock interaction if an error occurs
  //     setIsPlaying(false); // Ensure playing state is false on error
  //   }
  // }, []);

  useEffect(() => {
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      console.warn("Browser does not support speech recognition.");
      return;
    }

    if (startButton) {
      if (steps.length > 0 && isClient) {
        // Only run when mounted on the client side
        speak(steps[0].question);
        setMessages([{ text: steps[0].question, sender: "bot" }]);
      }
    }
  }, [speak, isClient, startButton]);

  useEffect(() => {
    if (!listening && transcript) {
      handleAnswer(transcript);
    }
  }, [transcript, listening]);
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const handleAnswer = async (answer: string) => {
    if (!answer.trim()) return;
    setIsValidating(true);
    console.log(messages);
    const { property, instructions, question } = steps[currentStep];
    const newMessages: Message[] = [
      ...messages,
      { text: answer, sender: "user" },
    ];
    setMessages(newMessages);
    try {
      const res = await fetch(`/api/${property}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: answer, chatHistory: newMessages }),
      });

      const data = await res.json();
      setMessages([...newMessages, { text: data.response, sender: "bot" }]);
      if (!data?.brandDescription) {
        speak(data.response);
      }
      if (data?.brandName) {
        setBrandName(data?.brandName);
          await delay(8000);
        if (currentStep < steps.length - 1) {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          speak(steps[nextStep].question);
          // you are till reaching the
          setMessages((prev) => [
            ...prev,
            { type: "bot", text: steps[nextStep].question, sender: "bot" },
          ]);
        } else {
          setIsInteracting(false);
        }
      } else if (data?.brandDescription) {
        setDescription(data?.brandDescription);
        console.log("Calling brandAnalysis API...");
        console.log(brandName, data?.brandDescription);
        setLoader(true);
        await submitToAPI(brandName, data?.brandDescription);
        setLoader(false);

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

  // useEffect(()=>{
  //   submitToAPI(" ConnectEase"," ConnectEase is a next-generation MVNO (Mobile Virtual Network Operator) committed to providing affordable, reliable, and seamless mobile connectivity. With nationwide coverage, easy phone compatibility, and no hidden fees, ConnectEase ensures that users stay connected without complications. Whether at home, work, or traveling, ConnectEase offers flexible plans tailored to modern communication needs.")
  // },[])
  const submitToAPI = async (brandName: string, description: string): Promise<void> => {
    const data = {
      brandName,
      brandDescription: description,
    };
  
    try {
      console.log("Submitting data:", data);
  
      // Initialize response state with empty values
      setResponses((prev) => ({
        ...prev,
        brandResult: "",
        coverImage: "",
        highlightSections: {},
        subscriptionPlans: {},
      }));
  
      // First API call - Brand Analysis
      try {
        const brandRes = await fetch("/api/brandDescription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
  
        if (!brandRes.ok) throw new Error(`Brand Analysis Failed: ${brandRes.status}`);
  
        const brandResult = await brandRes.json();
        console.log("Brand analysis result:", brandResult);
  
        setResponses((prev) => ({ ...prev, brandResult }));
      } catch (error) {
        console.error(error);
        return;
      }
  
      // Second API call - Image Generation
      let coverImage = "";
      let ImageLink2 = "";
      let ImageLink1="";
      try {
        const imageRes = await fetch("/api/generateImages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
  
        if (!imageRes.ok) throw new Error(`Image Generation Failed: ${imageRes.status}`);
  
        const imageResult = await imageRes.json();
        console.log("Image generation result:", imageResult);
  
        coverImage = imageResult?.results[0]?.urls?.raw +"w=1440&h=500";
        ImageLink2 = imageResult?.results[1]?.urls?.small +"w=530&h=352";
        ImageLink1 = imageResult?.results[2]?.urls?.small +"w=530&h=352";
  
        console.log("Image1:", coverImage, "\nImage2:", ImageLink2);
  
        setResponses((prev) => ({ ...prev, coverImage }));
      } catch (error) {
        console.error(error);
        return;
      }
  
      // Third API call - AI-generated Image (Commented Out)
      
  
      // Fourth API call - Image & Text Combination
      try {
        const textRes = await fetch("/api/imageandText", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
  
        if (!textRes.ok) throw new Error(`Image & Text Combination Failed: ${textRes.status}`);
  
        const imageTextResult = await textRes.json();
        console.log("Image and text result:", imageTextResult);
  
        const highlightSections = JSON.parse(imageTextResult.response);
        highlightSections["Coverage Section"]["Image"] =ImageLink1;
        highlightSections["Phone Compatibility Section"]["Image"] = ImageLink2;
  
        setResponses((prev) => ({ ...prev, highlightSections }));
      } catch (error) {
        console.error(error);
        return;
      }
  
      // Fifth API call - Plan Generation
      try {
        const plansRes = await fetch("/api/planGenerator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
  
        if (!plansRes.ok) throw new Error(`Plan Generation Failed: ${plansRes.status}`);
  
        const subscriptionPlans = await plansRes.json();
        console.log("Plans generation result:", subscriptionPlans);
  
        setResponses((prev) => ({ ...prev, subscriptionPlans }));
      } catch (error) {
        console.error(error);
        return;
      }
    } catch (error) {
      console.error("Error during brand analysis submission:", error);
      setMessages((prev) => [...prev, { text: "Error submitting data", sender: "bot" }]);
    }

    try {
      const aiGeneratedData = { brandName:brandName,brandDescription: description };
      const aiGeneratedImageRes = await fetch("/api/generateAiImages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiGeneratedData),
      });
    
      if (!aiGeneratedImageRes.ok) throw new Error(`AI Image Generation Failed: ${aiGeneratedImageRes.status}`);
    
      const aiImageResult = await aiGeneratedImageRes.json();
      console.log("AI Images:", aiImageResult);
    
      setResponses((prev) => ({
        ...prev,
        aiGeneratedHeroImage: aiImageResult?.heroImage,
        aiGeneratedCoverageImage: aiImageResult?.highlightImages?.coverageImage,
        aiGeneratedPhoneCompatibilityImage: aiImageResult?.highlightImages?.phoneCompatibilityImage,
      }));
    } catch (error) {
      console.error(error);
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
        {/* Changes for UI */}
        {messages.length === 0 ? (
          <div className="flex justify-center items-center">
            <button
              onClick={() => setStartButton(true)}
              className=" mt-10 border-white border px-2 py-1 text-white"
            >
              {" "}
              Let's start the conversation
            </button>
          </div>
        ) : (
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
              <div className="flex justify-center flex-col gap-2 my-2">
                <ChooseColorPage
                  brandName={brandName}
                  setResponse={setResponses}
                />
                <button
                  className="border-white border px-2 py-1 text-black bg-white mt-2"
                  onClick={() => {
                    setResponses((prev) => {
                      console.log("Final Responses:", prev); // Debugging
                      if (Object.keys(prev).length > 0) {
                        onComplete(prev);
                      } else {
                        alert("Responses are not ready yet!");
                      }
                      return prev;
                    });
                  }}
                >
                  Click to show the final response
                </button>
                {isValidating}
              </div>
            )}
          </AnimatePresence>
        )}
      </main>

      {isInteracting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10">
          {/* {brandName } */}
          <motion.div
            className="w-32 h-32 mb-2 bg-white rounded-full opacity-50"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          />
          {transcript}
          <p className="text-white text-lg mt-4">
            {loader
              ? "Processing the input. Please wait for the final step"
              : listening
              ? "Listening..."
              : "Tap to Start Mic"}
          </p>
          {/* {description} */}
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

      {/* {!isInteracting  && (currentStep === steps.length-1  ?(
        <footer className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
          <Button
            onClick={startListening}
            className="w-16 h-16 flex items-center justify-center bg-white text-black rounded-full"
          >
            <Mic className="w-8 h-8" />
          </Button>
          <p className="text-center text-gray-400 mt-2 text-sm">Tap to Speak</p>
        </footer>
      ))} */}
    </div>
  );
}
