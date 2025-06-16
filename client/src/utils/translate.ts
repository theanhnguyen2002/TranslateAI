export const fetchGoogleTranslate = async (text: string, sl: string, tl: string, dt: string[] = ["t"]) => {
  if (!text || !sl || !tl) return null;
  try {
    const response = await fetch(
      'https://mjhacyvdxd.execute-api.ap-southeast-1.amazonaws.com/translate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          sourceLang: sl,
          targetLang: tl,
        }),
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Lỗi dịch thuật:", error);
    return null;
  }
};

export const fetchTranslation = async (text: string, sl: string, tl: string) => {
  const data = await fetchGoogleTranslate(text, sl, tl);
  if (data && data.translatedText) {
    return data.translatedText;
  }
  return "Không thể dịch";
};

export const fetchTransliteration = async (text: string, sl: string, tl: string) => {
  const data = await fetchGoogleTranslate(text, sl, tl, ["t", "rm"]);
  if (data && data[0]) {
    const translatedText = data[0].map((item: any) => item[0]).join("");
    const transliteration = data[0].map((item: any) => item[3] || "").join(" ");
    return { translatedText, transliteration: transliteration || "Không có phiên âm có sẵn" };
  }
  return { translatedText: "Không thể dịch.", transliteration: "Không có phiên âm có sẵn" };
}; 