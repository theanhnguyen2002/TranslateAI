import { useEffect, useRef, useState } from "react";
import { IconArrowLeftRight } from "../../components/icon/IconArrowLeftRight";
import { IconClose } from "../../components/icon/IconClose";
import Header from "../../layout/header";
import { languages } from "../../utils/languages";
import s from "./style.module.scss";
import { Button } from "@mui/material";
import { IconVolume } from "../../components/icon/IconVolume";
import { IconMic } from "../../components/icon/IconMic";
import { IconStop } from "../../components/icon/IconStop";
import { IconCopy } from "../../components/icon/IconCopy";
import { toast } from "react-toastify";

type Props = {};

const TranslatePage = (props: Props) => {
  const [selectedLang1, setSelectedLang1] = useState("vi");
  const [selectedLang2, setSelectedLang2] = useState("en");
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  // const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeakingText, setIsSpeakingText] = useState(false);
  const [isSpeakingTranslated, setIsSpeakingTranslated] = useState(false);
  const recognitionRef = useRef<any>(null);

  const swapLanguages = () => {
    setSelectedLang1(selectedLang2);
    setSelectedLang2(selectedLang1);
    setText(translatedText);
    setTranslatedText(text);
  };

  const speakText = (text: string, lang: string, type: "text" | "translated") => {
    if (!text) return;

    const isSpeaking = type === "text" ? isSpeakingText : isSpeakingTranslated;
    const setIsSpeaking = type === "text" ? setIsSpeakingText : setIsSpeakingTranslated;

    if (isSpeaking) {
      speechSynthesis.cancel(); // Dừng giọng đọc
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.onend = () => setIsSpeaking(false); // Cập nhật trạng thái khi đọc xong
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const toggleListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói!");
      return;
    }

    if (!isListening) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = selectedLang1;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText((prevText) => prevText + " " + transcript);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (!text.trim()) {
      setTranslatedText("");
      return;
    }

    const fetchTranslation = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${selectedLang1}&tl=${selectedLang2}&dt=t&q=${encodeURIComponent(
            text
          )}`
        );

        const data = await response.json();
        setTranslatedText(
          data[0].map((item: any) => item[0]).join("") || "Không thể dịch"
        );
      } catch (error) {
        console.error("Lỗi dịch thuật:", error);
        setTranslatedText("Lỗi dịch thuật");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchTranslation, 500);
    return () => clearTimeout(timeoutId);
  }, [text, selectedLang1, selectedLang2]);

  return (
    <div className={`${s.rainbow_bg} justify-center items-center min-h-screen`}>
      <div className="header">
        <Header />
      </div>
      <div className="w-full flex justify-content-center">
        <div className="sm:flex gap-2 sm:gap-5 w-[85%] h-[500px] sm:h-[350px] mt-[92px]">
          <div className="w-full h-full">
            <div className="flex gap-2 px-3">
              <div className="flex gap-2 px-3">
                <Button>
                  <p className="text-[#035acb] m-auto">Phát hiện ngôn ngữ</p>
                </Button>
              </div>
              <div className="border-b-2 border-[#035acb]"></div>
              <select
                value={selectedLang1}
                onChange={(e) => setSelectedLang1(e.target.value)}
                className="p-2 border border-gray-600 rounded-md"
              >
                {languages.map((lang: any) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative w-full h-full">
              <div className="w-full h-full bg-white py-10 px-3 border-gray-300 rounded-2xl border">
                <textarea
                  className="w-full h-full resize-none outline-none"
                  placeholder="Nhập"
                  value={text}
                  onChange={(e) => {
                    if (e.target.value.length <= 5000) {
                      setText(e.target.value);
                    }
                  }}
                  maxLength={5000}
                />
              </div>
              {text && (
                <button
                  className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-600 p-1 rounded-full"
                  onClick={() => setText("")}
                >
                  <IconClose color="#035acb" />
                </button>
              )}
              <div className="absolute bottom-2 right-4 text-gray-500 text-sm">
                {text.split(/\s+/).filter(Boolean).length} từ • {text.length}
                /5.000 ký tự
              </div>
              <button
                className={`absolute bottom-2 left-2 p-1 rounded-full ${isListening
                  ? "bg-[#2a86ff] hover:bg-[#026efa]"
                  : "bg-gray-200 hover:bg-gray-300"
                  }`}
                onClick={toggleListening}
              >
                {isListening ? <IconStop color="#ffffff" /> : <IconMic />}
              </button>
              {text && (
                <button
                  className="absolute bottom-2 left-11 bg-gray-200 hover:bg-gray-300 text-gray-600 p-1 rounded-full"
                  onClick={() => speakText(text, selectedLang1, "text")}
                >
                  {isSpeakingText ? <IconStop color="#ffffff" /> : <IconVolume />}
                </button>
              )}
            </div>
          </div>
          <div
            className="flex sm:items-center justify-content-center"
            onClick={swapLanguages}
          >
            <IconArrowLeftRight width="24px" height="24px" />
          </div>
          <div className="w-full h-full">
            <div className="flex gap-2 px-3">
              <select
                value={selectedLang2}
                onChange={(e) => setSelectedLang2(e.target.value)}
                className="p-2 border border-gray-600 rounded-md"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative w-full h-full">
              <div className="w-full h-full bg-white py-10 px-3 border-gray-300 rounded-2xl border">
                <textarea
                  className="w-full h-full resize-none outline-none"
                  placeholder="Bản dịch..."
                  value={loading ? "Đang dịch..." : translatedText}
                  readOnly
                />
              </div>
              {translatedText && (
                <>
                  <button
                    className="absolute bottom-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-600 p-1 rounded-full"
                    onClick={() => {
                      navigator.clipboard.writeText(translatedText);
                      toast.success("Đã sao chép!");
                    }}
                  >
                    <IconCopy />
                  </button>
                  <button
                    className="absolute bottom-2 left-2 bg-gray-200 hover:bg-gray-300 text-gray-600 p-1 rounded-full"
                    onClick={() => speakText(translatedText, selectedLang2, "translated")}
                  >
                    {isSpeakingTranslated ? <IconStop color="#ffffff" /> : <IconVolume />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslatePage;
