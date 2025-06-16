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
import { fetchTranslation, fetchTransliteration } from "../../utils/translate";

type Props = {};

const TranslatePage = (props: Props) => {
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

  const swapLanguages = () => {
    setSelectedLang1(selectedLang2);
    setSelectedLang2(selectedLang1);
    setText(translatedText);
    setTranslatedText(text);
  };

  const speakText = (
    text: string,
    lang: string,
    type: "text" | "translated"
  ) => {
    if (!text) return;

    const isSpeaking = type === "text" ? isSpeakingText : isSpeakingTranslated;
    const setIsSpeaking =
      type === "text" ? setIsSpeakingText : setIsSpeakingTranslated;

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
      setTransliteratedText(result.transliteration);
    } catch (error) {
      setTransliteratedText("Lỗi lấy phiên âm.");
    }
  };

  useEffect(() => {
    if (
      !translatedText ||
      !selectedLang2 ||
      translatedText === "Không thể dịch" ||
      translatedText === "Lỗi dịch thuật"
    ) {
      return;
    }
    fetchTransliterationData(translatedText, selectedLang2);
  }, [translatedText, selectedLang2]);

  return (
    <div className={`${s.rainbow_bg} justify-center items-center h-screen`}>
      <div className="header">
        <Header />
      </div>
      <div className="overflow-y-auto max-h-screen sm:h-screen">
        <div className="w-full flex justify-content-center pb-[24px] max-h-full overflow-y-auto sm:h-screen">
          <div className="sm:flex sm:gap-5 w-[85%] h-full sm:h-[350px] mt-[24px] sm:mt-[52px]">
            <div className="w-full h-full">
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
                    {languages.find((lang) => lang.code === selectedLang1)
                      ?.name || "Select Language"}
                    <svg
                      className="w-2.5 h-2.5 ms-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 10 6"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m1 1 4 4 4-4"
                      />
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
                    className="w-full h-full min-h-[200px] resize-none outline-none"
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
                  {text.split(/\s+/).filter(Boolean).length} từ • {text.length}
                  /5.000 ký tự
                </div>
                <button
                  className={`absolute bottom-2 left-2 p-1 rounded-full ${
                    isListening
                      ? "bg-[#2a86ff] hover:bg-[#026efa]"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={toggleListening}
                >
                  {isListening ? (
                    <IconStop width="22px" height="22px" color="#ffffff" />
                  ) : (
                    <IconMic width="22px" height="22px" color="#3a79cb" />
                  )}
                </button>
                {text && (
                  <button
                    className="absolute bottom-2 left-11 bg-gray-200 hover:bg-gray-300 text-gray-600 p-1 rounded-full"
                    onClick={() => speakText(text, selectedLang1, "text")}
                  >
                    {isSpeakingText ? (
                      <IconStop width="22px" height="22px" color="#ffffff" />
                    ) : (
                      <IconVolume width="22px" height="22px" color="#3a79cb" />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div
              className="flex sm:items-center justify-content-center py-2.5"
              onClick={swapLanguages}
            >
              <IconArrowLeftRight width="24px" height="24px" />
            </div>
            <div className="w-full h-full">
              <div className="flex gap-2 px-3">
                <div className="relative inline-block">
                  <button
                    onClick={() => setIsOpenLang2(!isOpenLang2)}
                    className="min-w-[176px] flex justify-content-between text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-2.5 text-center inline-flex items-center"
                  >
                    {languages.find((lang) => lang.code === selectedLang2)
                      ?.name || "Select Language"}
                    <svg
                      className="w-2.5 h-2.5 ms-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 10 6"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m1 1 4 4 4-4"
                      />
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
                <div className="w-full h-full bg-white py-10 px-3 border-gray-300 rounded-2xl border">
                  <textarea
                    className="w-full h-full min-h-[200px] resize-none outline-none"
                    placeholder="Bản dịch..."
                    value={loading ? "Đang dịch..." : translatedText}
                    readOnly
                  />
                  {transliteratedText && (
                    <p className="text-gray-500 text-sm mt-1">
                      {transliteratedText}
                    </p>
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
                      onClick={() =>
                        speakText(translatedText, selectedLang2, "translated")
                      }
                    >
                      {isSpeakingTranslated ? (
                        <IconStop width="22px" height="22px" color="#ffffff" />
                      ) : (
                        <IconVolume
                          width="22px"
                          height="22px"
                          color="#3a79cb"
                        />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslatePage;
