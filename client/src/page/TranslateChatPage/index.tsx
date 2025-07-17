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
import { socket } from "../../utils/socket";
import { fetchTranslation, fetchTransliteration, sendAudioToServer } from "../../utils/translate";
import s from "./style.module.scss";


type Props = {};

const TranslateChatPage = (props: Props) => {
  const [selectedLang1, setSelectedLang1] = useState("vi");
  const [selectedLang2, setSelectedLang2] = useState("en");
  const [, setTransliteratedText] = useState("");
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening1, setIsListening1] = useState(false); // Mic 1
  const [isListening2, setIsListening2] = useState(false); // Mic 2
  const [isSpeakingText, setIsSpeakingText] = useState(false);
  const [isSpeakingTranslated, setIsSpeakingTranslated] = useState(false);
  const [isOpenLang1, setIsOpenLang1] = useState(false);
  const [isOpenLang2, setIsOpenLang2] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const selectedLang1Name = languages.find((lang) => lang.code === selectedLang1)?.name || "Ngôn ngữ";
  const selectedLang2Name = languages.find((lang) => lang.code === selectedLang2)?.name || "Ngôn ngữ";
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const clientId = useRef(""); // Giữ mã client của thiết bị hiện tại
  const [ownClientId, setOwnClientId] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const hasRegistered = useRef(false);

  useEffect(() => {
    const fetchAndRegister = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/get-client-id");
        const data = await res.json();

        if (!hasRegistered.current) {
          clientId.current = data.clientId;
          setOwnClientId(data.clientId);
          socket.emit("register", data.clientId);
          hasRegistered.current = true;
        }
      } catch (error) {
        toast.error("❌ Không thể lấy mã thiết bị!");
      }
    };

    fetchAndRegister();
  }, []);

  useEffect(() => {
    const handleReceiveMessage = (data: { text: string; translatedText: string; from: string }) => {
      console.log("📥 Tin nhắn từ thiết bị khác:", data);
      setText(data.text);
      setTranslatedText(data.translatedText);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }, []);
  const swapLanguages = () => {
    const tempLang = selectedLang1;
    const tempText = text;
    setSelectedLang1(selectedLang2);
    setSelectedLang2(tempLang);
    setText(translatedText);
    setTranslatedText(tempText);
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
      const voice = voices.find(v => v.lang.includes(lang));
      if (voice) utterance.voice = voice;
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

  const stopRecording = (
    mic: 1 | 2,
    setIsListening: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const toggleListening = (mic: 1 | 2) => {
    const isListening = mic === 1 ? isListening1 : isListening2;
    const setIsListening = mic === 1 ? setIsListening1 : setIsListening2;
    if (isListening) {
      stopRecording(mic, setIsListening);
    } else {
      recordAndTranscribe(mic);
    }
  };

  const recordAndTranscribe = (mic: 1 | 2) => {
    const setIsListening = mic === 1 ? setIsListening1 : setIsListening2;
    const sourceLang = mic === 1 ? selectedLang1 : selectedLang2;
    const targetLang = mic === 1 ? selectedLang2 : selectedLang1;
    let chunks: BlobPart[] = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      setIsListening(true);
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        setIsListening(false);
        try {
          const transcript = await sendAudioToServer(audioBlob);
          if (!transcript) return toast.error("Không thể nhận diện giọng nói.");
          if (mic === 1) {
            setText(transcript);
            const result = await fetchTranslation(transcript, sourceLang, targetLang);
            setTranslatedText(result);
            speakText(result, targetLang, "translated");
            socket.emit("send_message", {
              to: partnerId,
              from: clientId.current,
              text: transcript,
              translatedText: result,
            });
          } else {
            setTranslatedText(transcript);
            const result = await fetchTranslation(transcript, sourceLang, targetLang);
            setText(result);
            speakText(result, targetLang, "text");
          }
        } catch (err) {
          console.error("Lỗi khi nhận giọng nói:", err);
          toast.error("Lỗi khi xử lý giọng nói");
        }
      };
      mediaRecorder.start();
    }).catch((err) => {
      console.error("Không thể truy cập mic:", err);
      toast.error("Không thể truy cập microphone.");
      setIsListening(false);
    });
  };

  useEffect(() => {
    if (!text.trim()) {
      setTranslatedText("");
      return;
    }
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await fetchTranslation(text, selectedLang1, selectedLang2);
        setTranslatedText(result);
      } catch {
        setTranslatedText("Lỗi dịch thuật");
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [text, selectedLang1, selectedLang2]);

  useEffect(() => {
    if (translatedText && selectedLang2) {
      fetchTransliteration(translatedText, selectedLang1, selectedLang2)
        .then(result => {
          setTranslatedText(result.translatedText);
          setTransliteratedText(result.transliteration);
        })
        .catch(() => {
          setTranslatedText("Lỗi dịch.");
          setTransliteratedText("Lỗi lấy phiên âm.");
        });
    }
  }, [translatedText, selectedLang2]);


  return (
    <div className={`${s.rainbow_bg} justify-center items-center h-screen`}>
      <div className="header">
        <Header />
      </div>
      {/* <NavLink to={EPath.translation_conversation}>test chat</NavLink> */}
      <p style={{ textAlign: "center", marginTop: 10 }}>
        👉 Mã thiết bị của bạn: <strong>{ownClientId}</strong>
      </p>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value)}
          placeholder="Nhập mã thiết bị cần kết nối"
          className="border px-3 py-2 rounded w-full"
        />
        <button
          onClick={() => {
            if (partnerId.trim()) {
              toast.success(`🔗 Đã kết nối tới mã: ${partnerId}`);
              // Optionally gửi sự kiện tới server:
              socket.emit("connect_to_partner", {
                from: clientId.current,
                to: partnerId,
              });
            } else {
              toast.error("Vui lòng nhập mã thiết bị!");
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Kết nối
        </button>
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-112px)] sm:h-screen">
        <h2 className="text-2xl font-bold mb-4 text-center mt-[24px] sm:mt-[24px]">Hội thoại</h2>
        <div className="w-full h-auto flex justify-content-center pb-[48px] max-h-full h-screen sm:h-0">
          <div className="sm:flex sm:gap-5 w-[85%]">
            <div className="w-full pb-4">
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
              <div className="relative w-full h-auto">
                <div className="w-full bg-white py-10 px-3 border-gray-300 rounded-2xl border">
                  <textarea
                    className="w-full h-full min-h-[200px] resize-none outline-none cursor-default"
                    placeholder={`Bản dịch ${selectedLang1Name}...`}
                    value={text}
                    onChange={(e) => {
                      if (e.target.value.length <= 5000) {
                        setText(e.target.value);
                      }
                    }}
                    maxLength={5000}
                    readOnly
                  />
                  <div className="relative">
                    <div className="absolute top-[11px] left-1/2 -translate-x-1/2">
                      <button
                        className={` left-4 bottom-2 p-3 rounded-full shadow-lg z-50 transition-all duration-200 ${isListening1
                          ? 'bg-[#2a86ff] hover:bg-[#1a76ef]'
                          : !("webkitSpeechRecognition" in window)
                            ? 'bg-gray-200 cursor-not-allowed'
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
                  <div className="absolute bottom-2 right-4 text-gray-500 text-sm sm:text-sm text-[11px]">
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
            </div>
            <div
              className="flex sm:items-center justify-content-center py-3"
              onClick={swapLanguages}
            >
              <div className="cursor-pointer">
                <IconArrowLeftRight width="24px" height="24px" />
              </div>
            </div>
            <div className="w-full">
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
              <div className="relative w-full h-auto">
                {/* <div className="absolute top-2 right-2 flex items-center gap-2 px-3 mt-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={autoSpeak}
                      onChange={(e) => setAutoSpeak(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    Tự động phát âm bản dịch
                  </label>
                </div> */}
                <div className="w-full bg-white py-10 px-3 border-gray-300 rounded-2xl border">
                  <textarea
                    className="w-full h-full min-h-[200px] resize-none outline-none cursor-default"
                    placeholder={`Bản dịch ${selectedLang2Name}...`}
                    value={loading ? "Đang dịch..." : translatedText}
                    readOnly
                  />
                  <div className="relative">
                    <div className="absolute top-[11px] left-1/2 -translate-x-1/2">
                      <button
                        className={`right-4 bottom-2 p-3 rounded-full shadow-lg z-50 transition-all duration-200 ${isListening2
                          ? 'bg-[#2a86ff] hover:bg-[#1a76ef]'
                          : !("webkitSpeechRecogÏnition" in window)
                            ? 'bg-gray-200 cursor-not-allowed'
                            : 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
                          }`}
                        onClick={() => toggleListening(2)}
                      >
                        {isListening2 ? (
                          <IconStop width="24px" height="24px" color="#fff" />
                        ) : (
                          <IconMic width="22px" height="22px" color="#3a79cb" />
                        )}
                      </button>
                    </div>
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

    </div>
  );
};

export default TranslateChatPage;
