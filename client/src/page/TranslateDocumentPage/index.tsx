import React, { useState } from "react";
import s from "./style.module.scss";
import Header from "../../layout/header";
import { Button } from "@mui/material";
import { IconArrowLeftRight } from "../../components/icon/IconArrowLeftRight";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
// import "pdfjs-dist/build/pdf.worker.entry"; // Bắt buộc nếu dùng Webpack
import { fetchAPITranslate } from "../../utils/translate"; // Giả sử bạn đã có

const languages = [
  { code: "vi", name: "Tiếng Việt" },
  { code: "en", name: "English" },
  { code: "ja", name: "Tiếng Nhật" },
  { code: "ko", name: "Tiếng Hàn" },
  { code: "zh", name: "Tiếng Trung" },
  // ... thêm nếu cần
];

const TranslateDocumentPage = () => {
  const [sourceLang, setSourceLang] = useState("vi");
  const [targetLang, setTargetLang] = useState("en");
  const [fileText, setFileText] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (fileExt === "txt") {
      const text = await file.text();
      setFileText(text);
    } else if (fileExt === "docx") {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      setFileText(result.value);
    } else if (fileExt === "pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + "\n";
      }
      setFileText(text);
    } else {
      alert("Định dạng không hỗ trợ. Vui lòng tải PDF, DOCX hoặc TXT.");
    }
  };

  const handleTranslateDocument = async () => {
    if (!fileText) {
      alert("Bạn chưa tải tài liệu nào.");
      return;
    }

    try {
      const translated = await fetchAPITranslate(fileText, sourceLang, targetLang);
      setTranslatedText(translated);
    } catch (error) {
      alert("Lỗi khi dịch tài liệu.");
    }
  };

  return (
    <div className={`${s.rainbow_bg} justify-center items-center min-h-screen`}>
      <div className="header">
        <Header />
      </div>
      <div className="w-full flex justify-content-center">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-4 sm:px-10">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-10">
            <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">📄 Dịch Tài Liệu</h2>

            {/* Tải tệp */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tải tài liệu cần dịch</label>
              <div
                onClick={() => document.getElementById("fileInput")?.click()}
                className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg py-6 px-4 text-center hover:bg-blue-50 transition"
              >
                <p className="text-gray-600">📂 Nhấn hoặc kéo thả tệp vào đây</p>
                <p className="text-xs text-gray-400 mt-1">(Hỗ trợ: PDF, DOCX, TXT...)</p>
              </div>
              <input
                id="fileInput"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleUploadDocument}
              />
            </div>

            {/* Chọn ngôn ngữ */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Ngôn ngữ gốc</label>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Dịch sang</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nút dịch */}
            <div className="text-center">
              <button
                onClick={handleTranslateDocument}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                🚀 Dịch Ngay
              </button>
            </div>

            {/* Kết quả */}
            {translatedText && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">🔍 Kết quả dịch:</h3>
                <div className="bg-gray-50 p-4 border rounded-lg max-h-80 overflow-y-auto">
                  <p className="text-gray-800 whitespace-pre-wrap">{translatedText}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslateDocumentPage;
