import { Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { IconArrowLeftRight } from "../../components/icon/IconArrowLeftRight";
import { IconClose } from "../../components/icon/IconClose";
import { IconCopy } from "../../components/icon/IconCopy";
import { IconMic } from "../../components/icon/IconMic";
import { IconStop } from "../../components/icon/IconStop";
import { IconVolume } from "../../components/icon/IconVolume";
import Header from "../../layout/header";
import { languages } from "../../utils/languages";
import { fetchTranslation, fetchTransliteration } from "../../utils/translate";
import s from "./style.module.scss";

const WaveAnimation = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-12 h-12">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 border-2 border-blue-500 rounded-full animate-ping"
            style={{
              animationDelay: `${i * 0.2}s`,
              opacity: 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const DisabledOverlay = () => (
  <div className="absolute inset-0 bg-gray-400 bg-opacity-50 rounded-full flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  </div>
);

type Props = {};

const TranslateChatPage = (props: Props) => {
  const [selectedLang1, setSelectedLang1] = useState("vi");
  const [selectedLang2, setSelectedLang2] = useState("en");
  const [transliteratedText, setTransliteratedText] = useState("");
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening1, setIsListening1] = useState(false); // Mic 1
  const [isListening2, setIsListening2] = useState(false); // Mic 2
  const [isSpeakingText, setIsSpeakingText] = useState(false);
  const [isSpeakingTranslated, setIsSpeakingTranslated] = useState(false);
  const recognitionRef1 = useRef<any>(null); // Reference for Mic 1
  const recognitionRef2 = useRef<any>(null); // Reference for Mic 2
  const [isOpenLang1, setIsOpenLang1] = useState(false);
  const [isOpenLang2, setIsOpenLang2] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [recordTimeout, setRecordTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isPaused1, setIsPaused1] = useState(false);
  const [isPaused2, setIsPaused2] = useState(false);
  const [recordTimeout2, setRecordTimeout2] = useState<ReturnType<typeof setTimeout> | null>(null);



  useEffect(() => {
    // Load voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }, []);

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
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;

      // Find appropriate voice based on language
      if (lang === "vi") {
        // Try to find Vietnamese voice
        const vietnameseVoice = voices.find(voice => voice.lang.includes("vi"));
        if (vietnameseVoice) {
          utterance.voice = vietnameseVoice;
        }
      } else if (lang === "en") {
        // Try to find English voice
        const englishVoice = voices.find(voice => voice.lang.includes("en"));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }

      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeakingText(false);
    setIsSpeakingTranslated(false);
  };

  const toggleListening = (mic: 1 | 2) => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói!");
      return;
    }

    const recognitionRef = mic === 1 ? recognitionRef1 : recognitionRef2;
    const isListening = mic === 1 ? isListening1 : isListening2;
    const setIsListening = mic === 1 ? setIsListening1 : setIsListening2;
    const lang = mic === 1 ? selectedLang1 : selectedLang2;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (mic === 1 && recordTimeout) clearTimeout(recordTimeout);
      if (mic === 2 && recordTimeout2) clearTimeout(recordTimeout2);
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = lang === "vi" ? "vi-VN" : lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;

      if (mic === 1) {
        setText((prev) => prev + (prev ? " " : "") + transcript);
      } else {
        setTranslatedText((prev) => prev + (prev ? " " : "") + transcript);
        fetchTranslation(transcript, selectedLang2, selectedLang1)
          .then((result) => {
            setText((prev) => prev + (prev ? " " : "") + result);
          })
          .catch(() => {
            toast.error("Lỗi dịch ngược khi thu mic 2");
          });
      }
    };

    recognitionRef.current = recognition;
    recognition.start();

    // Tự động dừng sau 3 phút
    const timeout = setTimeout(() => {
      recognition.stop();
      setIsListening(false);
      toast.info("Đã tự dừng ghi âm sau 3 phút");
    }, 180000);

    if (mic === 1) setRecordTimeout(timeout);
    if (mic === 2) setRecordTimeout2(timeout);
  };




  useEffect(() => {
    if (!text.trim()) {
      setTranslatedText("");
      return;
    }

    const fetchTranslationData = async () => {
      setLoading(true);
      try {
        const result = await fetchTranslation(text, selectedLang1, selectedLang2);
        setTranslatedText(result);
      } catch (error) {
        console.error("Lỗi dịch thuật:", error);
        setTranslatedText("Lỗi dịch thuật");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchTranslationData, 500);
    return () => clearTimeout(timeoutId);
  }, [text, selectedLang1, selectedLang2]);

  const fetchTransliterationData = async (text: string, lang: string) => {
    if (!text || !lang) return;

    try {
      const result = await fetchTransliteration(text, selectedLang1, selectedLang2);
      setTranslatedText(result.translatedText);
      setTransliteratedText(result.transliteration);
    } catch (error) {
      console.error("Lỗi dịch thuật:", error);
      setTranslatedText("Lỗi dịch.");
      setTransliteratedText("Lỗi lấy phiên âm.");
    }
  };

  useEffect(() => {
    if (translatedText && selectedLang2) {
      fetchTransliterationData(translatedText, selectedLang2);
      if (autoSpeak) {
        speakText(translatedText, selectedLang2, "translated");
      }
    }
  }, [translatedText, selectedLang2, autoSpeak]);

  return (
    <div className={`${s.rainbow_bg} justify-center items-center h-screen overflow-y-auto`}>
      <div className="header">
        <Header />
      </div>
      <div className="w-full flex justify-content-center">
        <div className="sm:flex gap-2 sm:gap-5 w-[85%] h-[500px] sm:h-[350px] mt-[22px] sm:mt-[92px]">
          <div className="w-full sm:h-full h-[50%]">
            <div className="flex px-3">
              <div className="flex">
                <Button>
                  <p className="text-[#035acb] m-auto sm:text-[14px] text-[12px]">Phát hiện ngôn ngữ</p>
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
            <div className="relative w-full h-full h-full">
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
                <div className="relative">
                  <button
                    className={` left-4 bottom-2 p-3 rounded-full shadow-lg z-50 transition-all duration-200 ${isListening1
                      ? 'bg-[#2a86ff] hover:bg-[#1a76ef]'
                      : !("webkitSpeechRecognition" in window)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
                      }`}
                    onClick={() => toggleListening(1)}
                  >
                    {isListening1 ? (
                      <IconStop width="24px" height="24px" color="#fff" />
                    ) : (
                      <IconMic width="22px" height="22px" color="#3a79cb" />
                    )}
                  </button>
                </div>
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
              {text && (
                <button
                  className="absolute bottom-2 left-[9px] bg-gray-200 hover:bg-gray-300 text-gray-600 p-1 rounded-full"
                  onClick={() => speakText(text, selectedLang1, "text")}
                >
                  {isSpeakingText ? <IconStop width="22px" height="22px" color="#ffffff" /> : <IconVolume width="22px" height="22px" color="#3a79cb" />}
                </button>
              )}
            </div>
          </div>
          <div
            className="flex sm:items-center justify-content-center sm:mt-[0px] mt-[70px]"
            onClick={swapLanguages}
          >
            <IconArrowLeftRight width="24px" height="24px" />
          </div>
          <div className="w-full sm:h-full h-[50%] sm:mt-[0px] mt-[20px]">
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
                <div className="relative">
                  <button
                    className={`right-4 bottom-2 p-3 rounded-full shadow-lg z-50 transition-all duration-200 ${isListening2
                      ? 'bg-[#2a86ff] hover:bg-[#1a76ef]'
                      : !("webkitSpeechRecogÏnition" in window)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
                      }`}
                    onClick={() => toggleListening(2)}
                  >
                    {isListening2 ? (
                      <IconStop width="18px" height="18px" color="#fff" />
                    ) : (
                      <IconMic width="22px" height="22px" color="#3a79cb" />
                    )}
                  </button>
                </div>
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
    </div>
  );
};

export default TranslateChatPage;
