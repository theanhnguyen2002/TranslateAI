// translation.ts

import { languages } from "./languages";


export type TranslationResult = {
  translatedText: string;
  transliteration: string;
};

const BACKEND_URL = "http://sportshophn.shop/api";

export const fetchTranslation = async (
  text: string,
  sl: string,
  tl: string
): Promise<string> => {
  try {
    const response = await fetch(`${BACKEND_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, sourceLang: sl, targetLang: tl }),
    });
    const data = await response.json();
    return data?.data?.translations?.[0]?.translatedText || "Không thể dịch";
  } catch (error) {
    console.error("❌ Lỗi khi dịch văn bản:", error);
    return "Không thể dịch";
  }
};

export const fetchTransliteration = async (
  text: string,
  sl: string,
  tl: string
): Promise<TranslationResult> => {
  try {
    const response = await fetch(`${BACKEND_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, sourceLang: sl, targetLang: tl }),
    });
    const data = await response.json();
    const translation = data?.data?.translations?.[0];
    return {
      translatedText: translation?.translatedText || "Không thể dịch.",
      transliteration: translation?.transliteration || "Không có phiên âm.",
    };
  } catch (error) {
    console.error("❌ Lỗi khi lấy phiên âm:", error);
    return {
      translatedText: "Lỗi khi dịch",
      transliteration: "",
    };
  }
};

export const detectTextFromImage = async (base64Image: string): Promise<string> => {
  try {
    const response = await fetch(`${BACKEND_URL}/detect-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Image }),
    });
    const result = await response.json();
    return result.text || "Không thể nhận diện chữ.";
  } catch (error) {
    console.error("❌ Lỗi OCR:", error);
    return "Không thể xử lý ảnh.";
  }
};

export const sendAudioToServer = async (audioBlob: Blob, languageCode: string ): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice.webm");
    formData.append("languageCode", languageCode);
    const response = await fetch(`${BACKEND_URL}/speech-to-text`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    return data.transcript || null;
  } catch (error) {
    console.error("❌ Lỗi gửi âm thanh:", error);
    return null;
  }
};

export const fetchTextToSpeech = async (text: string, voiceCode: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/text-to-speech`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, lang: voiceCode }), // Truyền đúng voiceCode đang chọn
    });

    const data = await response.json();
    return data.audio;
  } catch (error) {
    console.error("❌ Lỗi khi gọi Text-to-Speech:", error);
    return "";
  }
};

