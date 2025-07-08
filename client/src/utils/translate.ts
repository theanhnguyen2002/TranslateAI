type TranslationResult = {
  translatedText: string;
  transliteration: string;
};

const GOOGLE_API_KEY = "AIzaSyCZjHJDsuQrBM0C4huWRx5Cdi6XVTRpwrs";

// Gọi API chính thức của Google Translate
export const fetchAPITranslate = async (
  text: string,
  sourceLang: string,
  targetLang: string,
  dtParams: string[] = ["t"]
) => {
  if (!text.trim() || !sourceLang || !targetLang) return null;

  const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`;

  const body = {
    q: text,
    source: sourceLang,
    target: targetLang,
    format: "text",
    model: "nmt",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi dịch thuật:", error);
    return null;
  }
};

// Trả về chỉ phần văn bản đã dịch
export const fetchTranslation = async (
  text: string,
  sl: string,
  tl: string
): Promise<string> => {
  const data = await fetchAPITranslate(text, sl, tl, ["t"]);
  const translation = data?.data?.translations?.[0]?.translatedText;
  return translation || "Không thể dịch";
};

// Trả về cả văn bản đã dịch và phiên âm
export const fetchTransliteration = async (
  text: string,
  sl: string,
  tl: string
): Promise<TranslationResult> => {
  const data = await fetchAPITranslate(text, sl, tl, ["t"]);
  const translation = data?.data?.translations?.[0];

  return {
    translatedText: translation?.translatedText || "Không thể dịch.",
    transliteration: translation?.transliteration || "Không có phiên âm có sẵn",
  };
};