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

const TranslateChatPage = (props: Props) => {
  const [selectedLang1, setSelectedLang1] = useState("vi");
  const [selectedLang2, setSelectedLang2] = useState("en");
  const [transliteratedText, setTransliteratedText] = useState("");
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingText, setIsSpeakingText] = useState(false);
  const [isSpeakingTranslated, setIsSpeakingTranslated] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [isOpenLang1, setIsOpenLang1] = useState(false);
  const [isOpenLang2, setIsOpenLang2] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

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

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeakingText(false);
    setIsSpeakingTranslated(false);
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
        const translated = data[0].map((item: any) => item[0]).join("") || "Không thể dịch";
        setTranslatedText(translated);

        // Auto speak translated text if enabled
        if (autoSpeak && translated !== "Không thể dịch") {
          speakText(translated, selectedLang2, "translated");
        }
      } catch (error) {
        console.error("Lỗi dịch thuật:", error);
        setTranslatedText("Lỗi dịch thuật");
        toast.error("Lỗi khi dịch văn bản");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchTranslation, 500);
    return () => clearTimeout(timeoutId);
  }, [text, selectedLang1, selectedLang2, autoSpeak]);

  const fetchTransliteration = async (text: string, lang: string) => {
    if (!text || !lang) return;

    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${selectedLang1}&tl=${selectedLang2}&dt=t&dt=rm&q=${encodeURIComponent(text)}`
      );
      const data = await response.json();
      console.log("API Response:", data); // Kiểm tra phản hồi từ API

      if (data[0]) {
        // Lấy văn bản đã dịch
        const translatedText = data[0].map((item: any) => item[0]).join("");
        setTranslatedText(translatedText);

        // Lấy phiên âm (transliteration)
        const transliteration = data[0].map((item: any) => item[3] || "").join(" ");
        setTransliteratedText(transliteration || "Không có phiên âm có sẵn");
        console.log("first", transliteration)
      } else {
        setTranslatedText("Không thể dịch.");
        setTransliteratedText("Không có phiên âm có sẵn");
      }
    } catch (error) {
      console.error("Lỗi dịch thuật:", error);
      setTranslatedText("Lỗi dịch.");
      setTransliteratedText("Lỗi lấy phiên âm.");
    }
  };

  useEffect(() => {
    if (translatedText && selectedLang2) {
      fetchTransliteration(translatedText, selectedLang2);
    }
  }, [translatedText, selectedLang2]);

  return (
    <div className={`${s.rainbow_bg} justify-center items-center h-screen overflow-y-auto`}>
      <div className="header">
        <Header />
      </div>
      <div className="w-full flex justify-content-center">
        <div className="sm:flex gap-2 sm:gap-5 w-[85%] h-[500px] sm:h-[350px] mt-[92px]">
          <div className="w-full h-full mb-10 md:mb-0">
            <div className="flex px-3">
              <div className="flex">
                <Button>
                  <p className="text-[#035acb] m-auto">Phát hiện ngôn ngữ</p>
                </Button>
              </div>
              <div className="border-b-2 border-[#035acb]"></div>
              <div className="relative inline-block">
                <button
                  onClick={() => setIsOpenLang1(!isOpenLang1)}
                  className="min-w-[176px] flex justify-content-between text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-2.5 text-center inline-flex items-center"
                >
                  {languages.find((lang) => lang.code === selectedLang1)?.name || "Select Language"}
                  <svg className="w-2.5 h-2.5 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 4 4 4-4" />
                  </svg>
                </button>
                {/* Dropdown menu */}
                {isOpenLang1 && (
                  <div className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 mt-1">
                    <ul className="max-h-96 overflow-y-auto py-2 pl-0 text-sm text-gray-700">
                      {languages.map((lang) => (
                        <li key={lang.code}>
                          <button
                            onClick={() => {
                              stopSpeaking();
                              setSelectedLang1(lang.code);
                              setIsOpenLang1(false);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            {lang.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
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
                  <IconClose width="22px" height="22px" color="#035acb" />
                </button>
              )}
              <div className="absolute bottom-2 right-4 text-gray-500 text-sm">
                {text.split(/\s+/).filter(Boolean).length} từ • {text.length}/5.000 ký tự
              </div>
              <button
                className={`absolute bottom-2 left-2 p-1 rounded-full sm:block hidden ${isListening
                  ? "bg-[#2a86ff] hover:bg-[#026efa]"
                  : "bg-gray-200 hover:bg-gray-300"
                  }`}
                onClick={toggleListening}
              >
                {isListening ? <IconStop width="22px" height="22px" color="#ffffff" /> : <IconMic width="22px" height="22px" color="#3a79cb" />}
              </button>
              {text && (
                <button
                  className="absolute bottom-2 left-11 bg-gray-200 hover:bg-gray-300 text-gray-600 p-1 rounded-full"
                  onClick={() => speakText(text, selectedLang1, "text")}
                >
                  {isSpeakingText ? <IconStop width="22px" height="22px" color="#ffffff" /> : <IconVolume width="22px" height="22px" color="#3a79cb" />}
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
          {/* Fixed mic button for mobile */}
          <button
            className={`fixed bottom-4 left-1/2 -translate-x-1/2 p-3 rounded-full shadow-lg sm:hidden z-50 ${
              isListening ? "bg-[#2a86ff] hover:bg-[#026efa]" : "bg-white hover:bg-gray-100"
            }`}
            onClick={toggleListening}
          >
            {isListening ? (
              <div className="relative">
                <IconStop width="24px" height="24px" color="#ffffff" />
                <div className="absolute -inset-1 rounded-full border border-[#2a86ff] animate-ping opacity-75"></div>
                <div className="absolute -inset-2 rounded-full border border-[#2a86ff] animate-ping opacity-50" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute -inset-3 rounded-full border border-[#2a86ff] animate-ping opacity-25" style={{ animationDelay: '0.4s' }}></div>
              </div>
            ) : (
              <IconMic width="24px" height="24px" color="#3a79cb" />
            )}
          </button>
          <div className="w-full h-full">
            <div className="flex gap-2 px-3">
              <div className="relative inline-block">
                <button
                  onClick={() => setIsOpenLang2(!isOpenLang2)}
                  className="min-w-[176px] flex justify-content-between text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-2.5 text-center inline-flex items-center"
                >
                  {languages.find((lang) => lang.code === selectedLang2)?.name || "Select Language"}
                  <svg className="w-2.5 h-2.5 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 4 4 4-4" />
                  </svg>
                </button>
                {/* Dropdown menu */}
                {isOpenLang2 && (
                  <div className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 mt-1">
                    <ul className="max-h-96 overflow-y-auto py-2 pl-0 text-sm text-gray-700">
                      {languages.map((lang) => (
                        <li key={lang.code}>
                          <button
                            onClick={() => {
                              stopSpeaking();
                              setSelectedLang2(lang.code);
                              setIsOpenLang2(false);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            {lang.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="relative w-full h-full">
              <div className="absolute top-2 right-2 flex items-center gap-2 px-3 mt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={autoSpeak}
                    onChange={(e) => setAutoSpeak(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  Tự động phát âm bản dịch
                </label>
              </div>
              <div className="w-full h-full bg-white py-10 px-3 border-gray-300 rounded-2xl border">
                <textarea
                  className="w-full h-full resize-none outline-none"
                  placeholder="Bản dịch..."
                  value={loading ? "Đang dịch..." : translatedText}
                  readOnly
                />
                {transliteratedText && (
                  <p className="text-gray-500 text-sm mt-1">{transliteratedText}</p>
                )}
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
                    <IconCopy color="#3a79cb" />
                  </button>
                  <button
                    className="absolute bottom-2 left-2 bg-gray-200 hover:bg-gray-300 text-gray-600 p-1 rounded-full"
                    onClick={() => speakText(translatedText, selectedLang2, "translated")}
                  >
                    {isSpeakingTranslated ? <IconStop width="22px" height="22px" color="#ffffff" /> : <IconVolume width="22px" height="22px" color="#3a79cb" />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default TranslateChatPage;
