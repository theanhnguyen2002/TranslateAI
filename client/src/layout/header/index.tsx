import { NavLink } from "react-router-dom";
import { EPath } from "../../route/route";

interface Props {}

const Header = (props: Props) => {
  return (
    <>
      <nav className="bg-white shadow shadow-gray-300 w-100 md:px-auto">
        <div className="md:h-16 h-28 mx-auto md:px-4 container flex items-center justify-between flex-wrap md:flex-nowrap">
          {/* Logo */}
          <div className="text-indigo-500 md:order-1">
            {/* Heroicon - Chip Outline */}
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg> */}
            <NavLink className="navbar_brand no-underline" to={EPath.root}>
              <p className="text-[#035acb] m-auto font-bold font-stretch-expanded">
                TRANSLATION
              </p>
            </NavLink>
          </div>
          <div className="text-gray-500 order-3 w-full md:w-auto md:order-2">
            <ul className="flex font-semibold justify-between pl-0 m-auto">
              <li className="md:px-4 md:py-2 text-indigo-500">
                <NavLink className="nav-link" to={EPath.translate}>
                  {({ isActive }) => (
                    <p
                      className={`${
                        isActive ? "text-[#035acb]" : "text-gray-500"
                      } m-auto text-xs sm:text-base`}
                    >
                      Dịch văn bản
                    </p>
                  )}
                </NavLink>
              </li>
              <li className="md:px-4 md:py-2 hover:text-indigo-400">
                <NavLink className="nav-link" to={EPath.translate_photo}>
                  {({ isActive }) => (
                    <p
                      className={`${
                        isActive ? "text-[#035acb]" : "text-gray-500"
                      } m-auto text-xs sm:text-base`}
                    >
                      Dịch hình ảnh
                    </p>
                  )}
                </NavLink>
              </li>
              <li className="md:px-4 md:py-2 hover:text-indigo-400">
                <NavLink className="nav-link" to={EPath.translate_document}>
                  {({ isActive }) => (
                    <p
                      className={`${
                        isActive ? "text-[#035acb]" : "text-gray-500"
                      } m-auto text-xs sm:text-base`}
                    >
                      Dịch tài liệu
                    </p>
                  )}
                </NavLink>
              </li>
              <li className="md:px-4 md:py-2 hover:text-indigo-400">
                <NavLink className="nav-link" to={EPath.translate_chat}>
                  {({ isActive }) => (
                    <p
                      className={`${
                        isActive ? "text-[#035acb]" : "text-gray-500"
                      } m-auto text-xs sm:text-base`}
                    >
                      Hội thoại
                    </p>
                  )}
                </NavLink>
              </li>
            </ul>
          </div>
          <div className="md:order-3">
            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-gray-50 rounded-xl flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Login</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
