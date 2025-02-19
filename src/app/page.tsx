"use client";

import { useState, useEffect } from "react";
import Chatbot from "./components/Chatbot";

export default function Home() {
  const [responses, setResponses] = useState<Record<string, string> | null>(null);
  const [landingPage, setLandingPage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Handle responses from the chatbot
  const handleComplete = (responses: Record<string, string>) => {
    setResponses(responses);
  };

  // Generate Landing Page
  const generateLandingPage = async () => {
    if (!responses) return;
    setLoading(true);
    setError(""); // Reset any previous errors

    const { brandName, brandDescription, keywords, targetAudience } = responses;

    try {
      const res = await fetch("/api/generateLandingPage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, brandDescription, keywords, targetAudience }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server Error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      setLandingPage(data.html || "");
    } catch (error: any) {
      console.error("Error generating landing page:", error);
      setError("Failed to generate landing page. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Download the generated landing page as HTML file
  const downloadLandingPage = () => {
    if (!landingPage) return;
    const blob = new Blob([landingPage], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "landing_page.html";
    link.click();
  };

  // Hydration protection (ensure this runs only on the client)
  useEffect(() => {
    if (typeof window === "undefined") return; // Avoid hydration mismatch on SSR
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {!responses ? (
        <Chatbot onComplete={handleComplete} />
      ) : landingPage ? (
        <div className="w-full max-w-4xl bg-white p-4 rounded-md shadow">
          <h2 className="text-xl font-semibold mb-4">Generated Landing Page</h2>
          <iframe className="w-full h-[500px]" srcDoc={landingPage} title="Landing Page Preview" />
          <button
            onClick={downloadLandingPage}
            className="mt-4 p-2 bg-green-500 text-white rounded-md"
          >
            Download HTML
          </button>
        </div>
      ) : (
        <div className="w-full bg-white p-4 rounded-md shadow">
          <h2 className="text-xl font-semibold mb-4">Responses Collected</h2>
          <pre className="bg-gray-100 p-4 rounded-md shadow text-sm text-gray-700">
            {JSON.stringify(responses, null, 2)}
          </pre>
          {/* {error && <p className="text-red-500 mt-2">{error}</p>}
          <button
            onClick={generateLandingPage}
            disabled={loading}
            className={`mt-4 p-2 text-white rounded-md ${loading ? "bg-gray-500" : "bg-blue-500"}`}
          >
            {loading ? "Generating..." : "Generate Landing Page"}
          </button> */}
        </div>
      )}
    </div>
  );
}
