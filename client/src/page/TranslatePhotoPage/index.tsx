import { Button } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Tesseract from 'tesseract.js';
import { IconArrowLeftRight } from "../../components/icon/IconArrowLeftRight";
import { IconClose } from "../../components/icon/IconClose";
import { IconCopy } from "../../components/icon/IconCopy";
import { IconMic } from "../../components/icon/IconMic";
import { IconStop } from "../../components/icon/IconStop";
import { IconVolume } from "../../components/icon/IconVolume";
import Header from "../../layout/header";
import { languages } from "../../utils/languages";
import { fetchTransliteration } from "../../utils/translate";
import s from "./style.module.scss";




type Props = {};

const TranslatePhotoPage = (props: Props) => {
  const [selectedLang1, setSelectedLang1] = useState("vi");
  const [selectedLang2, setSelectedLang2] = useState("en");
  const [isOpenLang1, setIsOpenLang1] = useState(false);
  const [isOpenLang2, setIsOpenLang2] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);

  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [isSpeakingText, setIsSpeakingText] = useState(false);
  const [transliteratedText, setTransliteratedText] = useState("");
  const [isSpeakingTranslated, setIsSpeakingTranslated] = useState(false);

  const [dragOver, setDragOver] = useState(false);



  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();

    let file: File | null = null;

    if ("dataTransfer" in e) {
      file = e.dataTransfer.files[0];
    } else {
      file = e.target.files?.[0] || null;
    }

    if (file && file.type.startsWith("image/")) {
      setImage(file);
      const imageURL = URL.createObjectURL(file);
      setImagePreview(imageURL);

      // 🧠 Bắt đầu tự động OCR và dịch sau khi ảnh được chọn
      try {
        setLoading(true);

        // OCR
        const { data } = await Tesseract.recognize(imageURL, 'eng+vie', {
          logger: (m) => console.log(m),
        });

        const ocrText = data.text.trim();
        setDetectedText(ocrText);

        if (ocrText) {
          // Dịch
          const { translatedText } = await fetchTransliteration(
            ocrText,
            selectedLang1,
            selectedLang2
          );
          setTranslatedText(translatedText);
        } else {
          setTranslatedText("Không nhận diện được chữ từ ảnh.");
        }

      } catch (error) {
        console.error("Lỗi xử lý ảnh:", error);
        setDetectedText("Không thể nhận diện văn bản.");
        setTranslatedText("Không thể dịch.");
      } finally {
        setLoading(false);
      }

    } else {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ.");
    }
  };


  const handleRemoveImage = () => {
    setImagePreview(null);
    setDragOver(false);
  };

  const handleTranslate = async () => {
    if (!detectedText) return;
    setLoading(true);
    const { translatedText } = await fetchTransliteration(detectedText, selectedLang1, selectedLang2);
    setTranslatedText(translatedText);
    setLoading(false);
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

  const swapLanguages = () => {
    setSelectedLang1(selectedLang2);
    setSelectedLang2(selectedLang1);
    setText(translatedText);
    setTranslatedText(text);
  };

  // tự động dịch lại khi thay đổi
  useEffect(() => {
    if (text && selectedLang1 && selectedLang2) {
      const timeout = setTimeout(() => {
        handleTranslate();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [text, selectedLang1, selectedLang2]);

  return (
    <div className={`${s.rainbow_bg} justify-center items-center min-h-screen`}>
      <div className="header">
        <Header />
      </div>
      <div className="overflow-y-auto max-h-screen sm:h-screen">
        <div className="sm:max-w-[85%] mx-auto p-4 sm:p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Dịch Ảnh</h2>
          {/* <NavLink to={EPath.translate_chatTest}>test chat</NavLink> */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Chọn ảnh để dịch</label>
            <label
              htmlFor="imageUpload"
              className="inline-block w-[200px] cursor-pointer rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700 hover:bg-blue-100 text-center"
            >
              📁 Tải ảnh lên
            </label>
            <div className="flex justify-content-center">
              {!imagePreview && (
                <div
                  onDrop={handleImageUpload}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  className={`sm:w-[40%] mt-[10px] bg-white border-2 border-dashed rounded-xl p-6 text-center transition ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
                    }`}
                >
                  <p className="text-gray-600 mb-2">
                    {dragOver ? "Thả ảnh vào đây" : "Thả ảnh vào đây"}
                  </p>
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

              )}
            </div>

            {imagePreview && (
              <div className="relative mt-4 max-w-md mx-auto">
                <img
                  src={imagePreview}
                  alt="Ảnh đã chọn"
                  className="max-h-[300px] w-full object-contain border rounded-lg shadow"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1 hover:bg-red-100 transition"
                  title="Xóa ảnh"
                >
                  <IconClose width="22px" height="22px" color="#035acb" />

                </button>
              </div>
            )}
          </div>



          {imagePreview && (
            <div className="flex h-[40px] justify-content-center sm:flex-row sm:items-center">
              {loading && (
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Đang xử lý ảnh và dịch...
                </div>
              )}
              {!loading && detectedText && translatedText && (
                <p className="text-green-700 font-medium">✅ Dịch ảnh hoàn tất</p>
              )}
            </div>
          )}

          <div className="max-h-screen sm:h-screen">
            <div className="w-full flex justify-content-center max-h-full overflow-y-auto sm:h-screen">
              <div className="sm:flex sm:gap-5 w-[100%] h-full sm:h-[350px]">
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
                        value={detectedText}
                        onChange={(e) => {
                          if (e.target.value.length <= 5000) {
                            setText(e.target.value);
                          }
                        }}
                        maxLength={5000}
                      />
                    </div>
                    {detectedText && (
                      <button
                        className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-600 p-1 rounded-full"
                        onClick={() => setText("")}
                      >
                        <IconClose width="22px" height="22px" color="#035acb" />
                      </button>
                    )}
                    <div className="absolute bottom-2 right-4 text-gray-500 text-sm">
                      {detectedText.split(/\s+/).filter(Boolean).length} từ • {detectedText.length}
                      /5.000 ký tự
                    </div>
                    <button
                      className={`absolute bottom-2 left-2 p-1 rounded-full ${isListening
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
      </div>
    </div>
  );
};

export default TranslatePhotoPage;
