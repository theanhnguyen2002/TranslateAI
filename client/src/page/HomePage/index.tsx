import { Button } from "@mui/material";
import { NavLink } from "react-router-dom";
import { EPath } from "../../route/route";

interface Props {}

const HomePage = (props: Props) => {
  return (
    <>
      <div className="h-screen bg-[#06213e]">
        <div className="relative isolate px-6 lg:px-8">
          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
          <div className="mx-auto max-w-4xl py-24 sm:py-48 lg:py-8">
            <div className=" sm:mb-8 flex justify-center">
              {/* <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                Announcing our next round of funding.{" "}
                <a href="#" className="font-semibold text-indigo-600">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Read more <span aria-hidden="true">→</span>
                </a>
              </div> */}
              <img
                className="w-[50%]"
                src="https://res.cloudinary.com/ddj3vx8q3/image/upload/v1741279866/Pngtree_internet_global_network_structure_map_5268639_xncu43.png"
                alt=""
              />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
                Chào mừng đến với Dịch AI
              </h1>
              <p className="mt-4 text-base font-medium text-pretty text-white sm:text-xl/8">
                Hỗ trợ dịch văn bản, giọng nói, hình ảnh và tài liệu nhanh
                chóng, chính xác, giúp bạn kết nối thế giới dễ dàng! 🌍
              </p>
              <Button className="mt-10 flex items-center justify-center gap-x-6">
                <NavLink
                  to={EPath.translate}
                  className="rounded-md bg-[#04cdf2] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#035acb]focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 no-underline"
                >
                  🚀 Dịch ngay!
                </NavLink>
              </Button>
            </div>
          </div>
          <div
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
