import { IconButton, Menu, MenuItem } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { IconRepeat } from "../../components/icon/IconRepeat";
import { IconEllipsis } from "../../components/icon/IconEllipsis";
import { IconMic } from "../../components/icon/IconMic";
import { IconStop } from "../../components/icon/IconStop";
import Header from "../../layout/header";
import { languages } from "../../utils/languages";
import { socket } from "../../utils/socket";
import {
  fetchTextToSpeech,
  fetchTranslation,
  sendAudioToServer,
} from "../../utils/translate";
import s from "./style.module.scss";

type Message = {
  from: "self" | "partner";
  original: string;
  translated: string;
};

const ConversationTranslation = () => {
  const [myLanguage, setMyLanguage] = useState("");
  const [partnerLanguage, setPartnerLanguage] = useState("en");
  const [isOpenLang1, setIsOpenLang1] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [listening, setListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const clientId = useRef("");
  const [ownClientId, setOwnClientId] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [anchorElMap, setAnchorElMap] = useState<{ [key: number]: HTMLElement | null }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [canPlayAudio, setCanPlayAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  useEffect(() => {
    const storedClientId = localStorage.getItem("clientId");

    if (storedClientId) {
      clientId.current = storedClientId;
      setOwnClientId(storedClientId);
      socket.emit("register", storedClientId);
    } else {
      fetch("https://api.sportshophn.shop/api/get-client-id")
        .then((res) => res.json())
        .then((data) => {
          clientId.current = data.clientId.toString();
          setOwnClientId(data.clientId.toString());
          localStorage.setItem("clientId", data.clientId.toString());
          socket.emit("register", data.clientId);
        })
        .catch(() => toast.error("Không lấy được mã thiết bị"));
    }
  }, []);

  useEffect(() => {
    socket.on("partner_connected", ({ to }) => {
      toast.success(`Đã kết nối với thiết bị ${to}`);
      setIsConnected(true);
    });

    socket.on("partner_not_found", ({ to }) => {
      toast.error(`Không tìm thấy thiết bị ${to}`);
      setIsConnected(false);
    });

    return () => {
      socket.off("partner_connected");
      socket.off("partner_not_found");
    };
  }, []);

  useEffect(() => {
    const handlePartnerLanguageUpdate = ({ partnerId, language }: { partnerId: string, language: string }) => {
      if (partnerId !== partnerId) return;
      setPartnerLanguage(language);
      // toast.info(`Thiết bị ${partnerId} đã đổi ngôn ngữ sang ${language}`);
    };

    socket.on("partner_language_updated", handlePartnerLanguageUpdate);

    return () => {
      socket.off("partner_language_updated", handlePartnerLanguageUpdate);
    };
  }, [partnerId]);

  useEffect(() => {
    const handleReceiveMessage = async (data: Message & { from: string, targetLang?: string }) => {
      if (!data.original || !data.translated) return;
      if (data.from === clientId.current) return;

      setMessages((prev) => [...prev, { ...data, from: "partner" }]);

      try {
        const targetLang = data.targetLang || partnerLanguage;
        const audioBase64 = await fetchTextToSpeech(data.translated, targetLang);

        if (canPlayAudio && audioBase64 && audioRef.current) {
          audioRef.current.src = audioBase64;
          await audioRef.current.play().catch((err) => {
            console.warn("Không thể phát âm thanh:", err);
          });
        } else if (canPlayAudio) {
          const utter = new SpeechSynthesisUtterance(data.translated);
          utter.lang = myLanguage;
          speechSynthesis.speak(utter);
        }
      } catch (err) {
        console.error("Lỗi xử lý TTS:", err);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [myLanguage, partnerLanguage, canPlayAudio]);


  const toggleRecording = async () => {
    if (listening) return stopRecording();
    setListening(true);
    const chunks: BlobPart[] = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        setListening(false);
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(chunks, { type: "audio/webm" });

        try {
          const transcript = await sendAudioToServer(audioBlob, myLanguage);
          if (!transcript || transcript.trim() === "") {
            toast.warning("Không nhận diện được giọng nói. Vui lòng thử lại!");
            return;
          }

          const translated = await fetchTranslation(transcript, myLanguage, partnerLanguage);

          const msg: Message = {
            from: "self",
            original: transcript,
            translated,
          };

          setMessages((prev) => [...prev, msg]);

          socket.emit("send_message", {
            to: partnerId,
            from: clientId.current,
            original: transcript,
            translated,
            targetLang: partnerLanguage,
          });
        } catch (err) {
          toast.error("Lỗi xử lý giọng nói");
        }
      };

      recorder.start();
    } catch (err) {
      toast.error("Không thể truy cập mic");
      setListening(false);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setListening(false);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, idx: number) => {
    setAnchorElMap((prev) => ({ ...prev, [idx]: event.currentTarget }));
  };

  const handleCloseMenu = (idx: number) => {
    setAnchorElMap((prev) => ({ ...prev, [idx]: null }));
  };

  return (
    <div className={`${s.rainbow_bg} justify-center items-center h-screen`}>
      <Header />

      <div className="overflow-y-auto max-h-[calc(100vh-112px)] sm:max-h-[calc(100vh-64px)]">
        <h2 className="text-2xl font-bold py-4 text-center">Hội thoại</h2>

        <div className="flex justify-center mb-4">
          <div className="relative inline-block">
            <button
              onClick={() => setIsOpenLang1(!isOpenLang1)}
              className="min-w-[176px] flex justify-between items-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-2.5"
            >
              {languages.find((lang) => lang.code === myLanguage)?.name || "Chọn ngôn ngữ"}
              <svg
                className="w-2.5 h-2.5 ms-1"
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

            {isOpenLang1 && (
              <div className="absolute z-10 bg-white rounded-lg shadow-sm w-44 mt-1">
                <ul className="max-h-96 overflow-y-auto py-2 text-sm text-gray-700 pl-0">
                  {languages.map((lang) => (
                    <li key={lang.code}>
                      <button
                        onClick={() => {
                          setMyLanguage(lang.code);
                          setIsOpenLang1(false);
                          // Gửi socket cập nhật ngôn ngữ mới
                          socket.emit("update_language", {
                            clientId: ownClientId,
                            language: lang.code,
                          });
                        }}
                        className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${lang.code === myLanguage ? "bg-gray-200 font-medium" : ""}`}
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

        <div className="flex gap-2 justify-center">
          <p className="text-sm text-gray-600 mt-auto mb-auto">
            Mã thiết bị của bạn: <strong>{ownClientId}</strong>
          </p>
          <button
            onClick={async () => {
              try {
                const res = await fetch("https://api.sportshophn.shop/api/get-client-id");
                const data = await res.json();
                if (data.clientId) {
                  clientId.current = data.clientId.toString();
                  setOwnClientId(data.clientId.toString());
                  socket.emit("register", data.clientId);
                  toast.success("Đã đổi mã thiết bị!");
                } else {
                  toast.error("Lấy mã thiết bị mới thất bại");
                }
              } catch {
                toast.error("Lấy mã thiết bị mới thất bại");
              }
            }}
            title="Đổi mã thiết bị"
          >
            <IconRepeat width="16px" height="16px" color="#0f67da" />
          </button>
        </div>

        <div className="flex justify-center px-8 mt-4">
          <div className="mb-2 w-full max-w-xl flex gap-2">
            <input
              className="w-full p-2 h-10 rounded border text-sm"
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              placeholder="Mã thiết bị cần kết nối"
            />
            <button
              onClick={() => {
                if (!myLanguage) return toast.warning("Vui lòng chọn ngôn ngữ của bạn");
                if (!partnerId.trim()) return toast.warning("Vui lòng nhập mã thiết bị");
                if (partnerId === ownClientId) return toast.error("Không thể kết nối với chính bạn");

                setCanPlayAudio(true); // ✅ đánh dấu cho phép autoplay
                audioRef.current = new Audio(); // ✅ tạo audio sau tương tác

                socket.emit("connect_to_partner", {
                  from: clientId.current,
                  to: partnerId.trim(),
                  language: myLanguage,
                });
              }}
              disabled={!myLanguage}
              className={`px-4 h-10 rounded text-sm whitespace-nowrap ${myLanguage
                ? "bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
                : "bg-gray-400 text-white cursor-not-allowed"
                }`}
            >
              Kết nối
            </button>
          </div>
        </div>

        <div className="flex justify-center px-8 mt-2">
          <div className="bg-white rounded-2xl shadow p-4 w-full max-w-xl overflow-y-auto h-[300px]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-3 flex ${msg.from === "self" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs p-2 rounded-lg ${msg.from === "self" ? "bg-green-100" : "bg-blue-100"}`}>
                  <p className="text-sm italic">"{msg.original}"</p>
                  <p className="font-semibold">{msg.translated}</p>
                </div>
                {msg.from === "partner" && (
                  <div className="h-[34px] mt-auto mb-auto">
                    <IconButton size="small" onClick={(e) => handleMenuClick(e, idx)}>
                      <IconEllipsis width="24px" height="24px" color="#4a4a4a" />
                    </IconButton>
                  </div>
                )}
                <Menu anchorEl={anchorElMap[idx]} open={Boolean(anchorElMap[idx])} onClose={() => handleCloseMenu(idx)}>
                  <MenuItem onClick={() => { navigator.clipboard.writeText(msg.translated); handleCloseMenu(idx); }}>
                    Sao chép
                  </MenuItem>
                  <MenuItem
                    onClick={async () => {
                      try {
                        const audioBase64 = await fetchTextToSpeech(msg.translated, myLanguage);
                        if (audioBase64) {
                          new Audio(audioBase64).play();
                        } else {
                          const utter = new SpeechSynthesisUtterance(msg.translated);
                          utter.lang = myLanguage;
                          speechSynthesis.speak(utter);
                        }
                      } catch (err) {
                        console.error("Lỗi phát lại:", err);
                      }
                      handleCloseMenu(idx);
                    }}
                  >
                    Phát lại
                  </MenuItem>
                </Menu>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center my-4">
          <button
            className={`p-3 rounded-full transition duration-200 ${listening ? "bg-red-500 hover:bg-red-600" : !isConnected ? "bg-gray-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"}`}
            onClick={() => {
              if (!isConnected) return toast.warning("Bạn chưa kết nối với thiết bị nào!");
              toggleRecording();
            }}
          >
            {listening ? <IconStop width="24px" height="24px" color="#fff" /> : <IconMic width="22px" height="22px" color="#fff" />}
          </button>
        </div>
      </div>
    </div >
  );
};

export default ConversationTranslation;
