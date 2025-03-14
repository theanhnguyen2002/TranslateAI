import React, { useState } from "react";
import s from "./style.module.scss";
import Header from "../../layout/header";
import { IconArrowLeftRight } from "../../components/icon/IconArrowLeftRight";
import { Button } from "@mui/material";

type Props = {};

const TranslateChatPage = (props: Props) => {
  const [selectedLang1, setSelectedLang1] = useState("vi");
  const [selectedLang2, setSelectedLang2] = useState("en");
  return (
    <div className={`${s.rainbow_bg} justify-center items-center min-h-screen`}>
      <div className="header">
        <Header />
      </div>
      <div className="w-full flex justify-content-center">
        <div className="sm:flex gap-2 sm:gap-5 w-[85%] h-[500px] sm:h-[350px] mt-[92px]">
          <div className="w-full h-full">
            <div className="flex gap-2">
              <div
                className={`${
                  selectedLang1 === "vi" ? "border-b-2 border-[#035acb]" : ""
                }`}
              >
                <Button onClick={() => setSelectedLang1("vi")}>
                  <p
                    className={`${
                      selectedLang1 === "vi"
                        ? "text-[#035acb]"
                        : "text-[#323232]"
                    } m-auto`}
                  >
                    Tiếng Việt
                  </p>
                </Button>
              </div>
              <div
                className={`${
                  selectedLang1 === "en" ? "border-b-2 border-[#035acb]" : ""
                }`}
              >
                <Button onClick={() => setSelectedLang1("en")}>
                  <p
                    className={`${
                      selectedLang1 === "en"
                        ? "text-[#035acb]"
                        : "text-[#323232]"
                    } m-auto`}
                  >
                    Tiếng Anh
                  </p>
                </Button>
              </div>
              <div
                className={`${
                  selectedLang1 === "other" ? "border-b-2 border-[#035acb]" : ""
                }`}
              >
                <Button onClick={() => setSelectedLang1("other")}>
                  <p
                    className={`${
                      selectedLang1 === "other"
                        ? "text-[#035acb]"
                        : "text-[#323232]"
                    } m-auto`}
                  >
                    Chọn ngôn ngữ
                  </p>
                </Button>
              </div>
            </div>
            <textarea
              className="p-4 border-r border-gray-300 w-full h-full resize-none outline-none border border-gray-600 rounded-lg"
              placeholder="Nhập"
            />
          </div>
          <div className="flex sm:items-center justify-content-center">
            <IconArrowLeftRight width="24px" height="24px" />
          </div>
          <div className="w-full h-full">
            <div className="flex gap-2">
              <div
                className={`${
                  selectedLang2 === "vi" ? "border-b-2 border-[#035acb]" : ""
                }`}
              >
                <Button onClick={() => setSelectedLang2("vi")}>
                  <p
                    className={`${
                      selectedLang2 === "vi"
                        ? "text-[#035acb]"
                        : "text-[#323232]"
                    } m-auto`}
                  >
                    Tiếng Việt
                  </p>
                </Button>
              </div>
              <div
                className={`${
                  selectedLang2 === "en" ? "border-b-2 border-[#035acb]" : ""
                }`}
              >
                <Button onClick={() => setSelectedLang2("en")}>
                  <p
                    className={`${
                      selectedLang2 === "en"
                        ? "text-[#035acb]"
                        : "text-[#323232]"
                    } m-auto`}
                  >
                    Tiếng Anh
                  </p>
                </Button>
              </div>
              <div
                className={`${
                  selectedLang2 === "other" ? "border-b-2 border-[#035acb]" : ""
                }`}
              >
                <Button onClick={() => setSelectedLang2("other")}>
                  <p
                    className={`${
                      selectedLang2 === "other"
                        ? "text-[#035acb]"
                        : "text-[#323232]"
                    } m-auto`}
                  >
                    Chọn ngôn ngữ
                  </p>
                </Button>
              </div>
            </div>
            <textarea
              className="p-4 w-full h-full resize-none outline-none border border-gray-600 rounded-lg"
              placeholder="Bản dịch..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslateChatPage;
