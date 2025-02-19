"use client"
import { useEffect, useState } from "react";

export default function SpeechSynthesizer() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    // Get available voices when the component is mounted
    const getVoices = () => {
      const voicesList = window.speechSynthesis.getVoices();
      setVoices(voicesList);
      if (voicesList.length > 0) {
        setSelectedVoice(voicesList[0]); // Set the first voice as default
      }
    };

    // Voices may not be available immediately, so check when they're loaded
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = getVoices;
    } else {
      getVoices(); // For browsers where voices are loaded immediately
    }
  }, []);

  const handleSpeech = () => {
    if (selectedVoice && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang; // Keep language same as selected voice
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div>
      <h2>Choose a Voice</h2>
      <select
        onChange={(e) => {
          const voice = voices.find((v) => v.name === e.target.value);
          if (voice) {
            setSelectedVoice(voice);
          }
        }}
        value={selectedVoice?.name}
      >
        {voices.map((voice) => (
          <option key={voice.name} value={voice.name}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to speak"
        rows={4}
        cols={50}
      />

      <button onClick={handleSpeech}>Speak</button>
    </div>
  );
}
