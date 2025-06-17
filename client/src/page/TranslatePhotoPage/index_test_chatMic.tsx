import { Button } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { IconMic } from "../../components/icon/IconMic";
import { IconStop } from "../../components/icon/IconStop";
import { fetchTransliteration } from "../../utils/translate";

const languages = [
  { code: "vi-VN", name: "Tiếng Việt" },
  { code: "en-US", name: "English" },
  { code: "ja-JP", name: "Tiếng Nhật" },
];

type Message = { from: "A" | "B"; original: string; translated: string };

const VoiceChatTranslator: React.FC = () => {
    const [langA, setLangA] = useState("vi-VN");
  const [langB, setLangB] = useState("en-US");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<"A" | "B" | null>(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    recognitionRef.current = new (window as any).webkitSpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => setListening(true);
    recognitionRef.current.onend = () => {
      setListening(false);
      setCurrentSpeaker(null);
    };

    recognitionRef.current.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const from = currentSpeaker!;
      const sl = from === "A" ? langA : langB;
      const tl = from === "A" ? langB : langA;

      const { translatedText } = await fetchTransliteration(transcript, sl.slice(0, 2), tl.slice(0, 2));

      setMessages((prev) => [...prev, { from, original: transcript, translated: translatedText }]);

      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.lang = tl;
      speechSynthesis.speak(utterance);
    };
  }, [langA, langB, currentSpeaker]);

  const toggleRecording = (speaker: "A" | "B") => {
    if (listening) {
      recognitionRef.current.stop();
    } else {
      setCurrentSpeaker(speaker);
      const lang = speaker === "A" ? langA : langB;
      recognitionRef.current.lang = lang;
      recognitionRef.current.start();
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Chat Dịch Giọng Nói Hai Chiều</h2>
      <div className="flex gap-4 mb-4">
        <select value={langA} onChange={(e) => setLangA(e.target.value)}>
          {languages.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
        <Button onClick={() => { const t = langA; setLangA(langB); setLangB(t); }}>↔️</Button>
        <select value={langB} onChange={(e) => setLangB(e.target.value)}>
          {languages.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white shadow rounded p-4 w-full max-w-xl flex-1 overflow-y-auto mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-3 flex ${msg.from === "A" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-xs p-2 rounded-lg ${msg.from === "A" ? "bg-blue-100" : "bg-green-100"}`}>
              <p className="text-sm italic">"{msg.original}"</p>
              <p className="font-semibold">{msg.translated}</p>
            </div>
          </div>
        ))}
        {listening && currentSpeaker && <p className="text-center text-blue-500">Đang nghe Người {currentSpeaker}...</p>}
      </div>

      <div className="flex gap-4">
        <Button variant="contained" color={listening && currentSpeaker === "A" ? "error" : "primary"} onClick={() => toggleRecording("A")}>  {listening && currentSpeaker === "A" ? <IconStop /> : <IconMic />} Người A nói
        </Button>
        <Button variant="contained" color={listening && currentSpeaker === "B" ? "error" : "secondary"} onClick={() => toggleRecording("B")}>  {listening && currentSpeaker === "B" ? <IconStop /> : <IconMic />} Người B nói
        </Button>
      </div>
    </div>
  );
};

export default VoiceChatTranslator;
