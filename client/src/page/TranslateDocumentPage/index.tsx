import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";
import React, { useState, useEffect } from "react";
import Header from "../../layout/header";
import s from "./style.module.scss";
import { IconUpload } from "../../components/icon/IconUpload";
import { languages } from "../../utils/languages";
import { fetchAPITranslate } from "../../utils/translate";
import { toast } from "react-toastify";

// Gán worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const TranslateDocumentPage = () => {
  const [selectedLang1, setSelectedLang1] = useState("vi");
  const [selectedLang2, setSelectedLang2] = useState("en");
  const [isOpenLang1, setIsOpenLang1] = useState(false);
  const [isOpenLang2, setIsOpenLang2] = useState(false);
  const [fileText, setFileText] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (fileText) {
      handleTranslateDocument();
    }
  }, [fileText]);

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement> | DragEvent) => {
    e.preventDefault();
    let file: File | undefined;

    if ('dataTransfer' in e) {
      file = e.dataTransfer?.files?.[0];
    } else {
      file = e.target?.files?.[0];
    }

    if (!file) return;

    setFileName(file.name);

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
      toast.error("Định dạng không hỗ trợ. Vui lòng tải PDF, DOCX hoặc TXT.");
    }
  };

  const handleTranslateDocument = async () => {
    if (!fileText) return;

    try {
      const translated = await fetchAPITranslate(fileText, selectedLang1, selectedLang2);
      setTranslatedText(translated);
    } catch (error) {
      toast.error("Lỗi khi dịch tài liệu.");
    }
  };

  const handleDownloadTranslatedFile = () => {
    if (!translatedText) return;

    const blob = new Blob([translatedText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `translated_${fileName || 'document'}.txt`;
    link.click();
  };

  return (
    <div className={`${s.rainbow_bg} justify-center items-center min-h-screen`}>
      <div className="header">
        <Header />
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-112px)] sm:h-screen">
        <h2 className="text-2xl font-bold mb-4 text-center mt-[24px] sm:mt-[24px]">Dịch tài liệu</h2>
        <div className="w-full h-auto flex justify-content-center pb-[28px] max-h-full h-screen sm:h-0">
          <div className="w-full sm:max-w-[85%] mx-auto p-4 sm:p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Chọn tệp để dịch</label>
              <div
                onClick={() => document.getElementById("fileInput")?.click()}
                onDrop={(e: any) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleUploadDocument(e);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                className={`cursor-pointer sm:w-[40%] mt-[10px] bg-white border-2 border-dashed rounded-xl p-6 text-center shadow-lg transition mx-auto ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"}`}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <IconUpload width="28px" height="28px" color="#035acb" />
                  <p className="text-sm text-gray-600">
                    {dragOver ? "Hỗ trợ: PDF, DOCX, TXT..." : "Nhấn hoặc kéo thả tệp vào đây"}
                  </p>
                </div>
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleUploadDocument}
                />
              </div>

              {fileName && (
                <div className="mt-4">
                  <p className="text-gray-700">Tên tệp đã chọn: <strong>{fileName}</strong></p>
                </div>
              )}

              {fileText && (
                <div className="mt-6">
                  <h3 className="text-base font-semibold mb-2 text-gray-700">📄 Nội dung tài liệu:</h3>
                  <div className="bg-gray-100 p-4 rounded-lg border max-h-80 overflow-y-auto whitespace-pre-wrap text-gray-800 text-sm">
                    {fileText}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Ngôn ngữ gốc</label>
                <div className="relative inline-block">
                  <button
                    onClick={() => setIsOpenLang1(!isOpenLang1)}
                    className="min-w-[176px] flex justify-content-between text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-2.5 text-center inline-flex items-center"
                  >
                    {languages.find((lang) => lang.code === selectedLang1)?.name || "Select Language"}
                    <svg className="w-2.5 h-2.5 ms-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 6">
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

              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Dịch sang</label>
                <div className="relative inline-block">
                  <button
                    onClick={() => setIsOpenLang2(!isOpenLang2)}
                    className="min-w-[176px] flex justify-content-between text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-2.5 text-center inline-flex items-center"
                  >
                    {languages.find((lang) => lang.code === selectedLang2)?.name || "Select Language"}
                    <svg className="w-2.5 h-2.5 ms-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 6">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 4 4 4-4" />
                    </svg>
                  </button>
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
            </div>

            <div className="text-center">
              {translatedText ? (
                <button
                  onClick={handleDownloadTranslatedFile}
                  className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
                >
                  ⬇️ Tải File Đã Dịch
                </button>
              ) : (
                <button
                  disabled
                  className="px-6 py-3 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed"
                >
                  Đang dịch...
                </button>
              )}
            </div>

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
