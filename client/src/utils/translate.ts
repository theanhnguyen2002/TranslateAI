type TranslationResult = {
  translatedText: string;
  transliteration: string;
};

// Gọi API dịch Google không chính thức
export const fetchAPITranslate = async (
  text: string,
  sourceLang: string,
  targetLang: string,
  dtParams: string[] = ["t"]
) => {
  if (!text.trim() || !sourceLang || !targetLang) return null;

  const baseUrl = "https://translate.googleapis.com/translate_a/single";
  const query = new URLSearchParams({
    client: "gtx",
    sl: sourceLang,
    tl: targetLang,
    q: text,
  });

  dtParams.forEach((dt) => query.append("dt", dt));

  try {
    const response = await fetch(`${baseUrl}?${query.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
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
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const translatedText = data[0].map((item: any) => item?.[0] || "").join("");
    return translatedText || "Không thể dịch";
  }
  return "Không thể dịch";
};

// Trả về cả văn bản đã dịch và phiên âm
export const fetchTransliteration = async (
  text: string,
  sl: string,
  tl: string
): Promise<TranslationResult> => {
  const data = await fetchAPITranslate(text, sl, tl, ["t", "rm"]);
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const translatedText = data[0].map((item: any) => item?.[0] || "").join("");
    const transliteration = data[0].map((item: any) => item?.[3] || "").join(" ").trim();
    return {
      translatedText: translatedText || "Không thể dịch.",
      transliteration: transliteration || "Không có phiên âm có sẵn",
    };
  }
  return {
    translatedText: "Không thể dịch.",
    transliteration: "Không có phiên âm có sẵn",
  };
};