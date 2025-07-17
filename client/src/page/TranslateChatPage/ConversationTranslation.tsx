import React, { useEffect, useRef, useState } from "react";
import { Button, IconButton, Menu, MenuItem } from "@mui/material";
import { IconMic } from "../../components/icon/IconMic";
import { IconStop } from "../../components/icon/IconStop";
import { socket } from "../../utils/socket";
import {
  sendAudioToServer,
  fetchTranslation,
  fetchTextToSpeech,
} from "../../utils/translate";
import Header from "../../layout/header";
import s from "./style.module.scss";
import { IconArrowLeftRight } from "../../components/icon/IconArrowLeftRight";
import { languages } from "../../utils/languages";
import { toast } from "react-toastify";
import { IconCopy2 } from "../../components/icon/IconCopy2";

type Message = {
  from: "self" | "partner";
  original: string;
  translated: string;
};

const ConversationTranslation = () => {
  const [myLanguage, setMyLanguage] = useState("vi");
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

  useEffect(() => {
    fetch("http://localhost:3001/api/get-client-id")
      .then((res) => res.json())
      .then((data) => {
        clientId.current = data.clientId.toString();
        setOwnClientId(data.clientId.toString());
        socket.emit("register", data.clientId);
      })
      .catch(() => toast.error("Không lấy được mã thiết bị"));
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
      toast.info(`Thiết bị ${partnerId} đã đổi ngôn ngữ sang ${language}`);
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
        const targetLang = data.targetLang || partnerLanguage; // fallback nếu server chưa gửi
        const audioBase64 = await fetchTextToSpeech(data.translated, targetLang);

        if (audioBase64) {
          const audio = new Audio(audioBase64);
          audio.play().catch((err) => {
            console.error("Lỗi phát âm:", err);
          });
        } else {
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
  }, [myLanguage]);

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
          const transcript = await sendAudioToServer(audioBlob);
          if (!transcript) return;

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

      <div className="overflow-y-auto max-h-[calc(100vh-64px)]">
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
                <ul className="max-h-96 overflow-y-auto py-2 text-sm text-gray-700">
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
          <p className="text-sm text-gray-600">
            Mã thiết bị của bạn: <strong>{ownClientId}</strong>
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(ownClientId);
              toast.success("Đã sao chép mã thiết bị!");
            }}
            title="Sao chép"
          >
            <IconCopy2 width="18px" height="18px" color="#035acb" />
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
                if (!partnerId.trim()) return toast.warning("Vui lòng nhập mã thiết bị");
                if (partnerId === ownClientId) return toast.error("Không thể kết nối với chính bạn");

                socket.emit("connect_to_partner", {
                  from: clientId.current,
                  to: partnerId.trim(),
                  language: myLanguage,
                });
              }}
              className="px-4 h-10 bg-blue-700 hover:bg-blue-800 text-white rounded text-sm"
            >
              Kết nối
            </button>
          </div>
        </div>

        <div className="flex justify-center px-8 mt-4">
          <div className="bg-white rounded-2xl shadow p-4 w-full max-w-xl overflow-y-auto min-h-[300px] max-h-[400px]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-3 flex ${msg.from === "self" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs p-2 rounded-lg ${msg.from === "self" ? "bg-green-100" : "bg-blue-100"}`}>
                  <p className="text-sm italic">"{msg.original}"</p>
                  <p className="font-semibold">{msg.translated}</p>
                </div>
                {msg.from === "partner" && (
                  <IconButton size="small" onClick={(e) => handleMenuClick(e, idx)}>...</IconButton>
                )}
                <Menu anchorEl={anchorElMap[idx]} open={Boolean(anchorElMap[idx])} onClose={() => handleCloseMenu(idx)}>
                  <MenuItem onClick={() => { navigator.clipboard.writeText(msg.translated); handleCloseMenu(idx); }}>
                    Sao chép
                  </MenuItem>
                  <MenuItem
                    onClick={async () => {
                      try {
                        const audioBase64 = await fetchTextToSpeech(msg.translated, partnerLanguage);
                        if (audioBase64) {
                          new Audio(audioBase64).play();
                        } else {
                          const utter = new SpeechSynthesisUtterance(msg.translated);
                          utter.lang = partnerLanguage;
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
            {listening && <p className="text-center text-blue-500">Đang nghe...</p>}
          </div>
        </div>

        <div className="flex justify-center mt-4">
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
    </div>
  );
};

export default ConversationTranslation;
