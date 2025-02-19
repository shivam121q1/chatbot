"use client"
import { useState } from "react";

interface Message {
    text: string;
    sender: "user" | "bot";
}

export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>("");
    const [brandName, setBrandName] = useState<string | null>(null);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessages: Message[] = [...messages, { text: input, sender: "user" }];
        setMessages(newMessages);
        setInput("");

        const response = await fetch("/api/description", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userInput: input, chatHistory: newMessages }),
        });

        const data = await response.json();
        setMessages([...newMessages, { text: data.response, sender: "bot" }]);

        if (data.brandDescription) {
            setBrandName(data.brandDescription);
        }
    };

    return (
        <div className="w-full mx-auto p-4 border rounded-lg shadow-lg">
            <div className="h-full overflow-y-auto border-b p-2">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-2 p-2 rounded ${
                            msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200"
                        }`}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="mt-2 flex">
                <input
                    type="text"
                    className="flex-1 p-2 border rounded"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded">
                    Send
                </button>
            </div>
            {brandName && <div className="mt-2 text-green-600">Brand Selected: {brandName}</div>}
        </div>
    );
}
