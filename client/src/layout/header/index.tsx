import { NavLink } from "react-router-dom";
import { EPath } from "../../route/route";

interface Props {}

const Header = (props: Props) => {
  return (
    <>
      <div>
        <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top border-b-2 border-[#035acb] ">
          <div className="flex w-full justify-between items-center px-24">
            <NavLink className="navbar_brand no-underline" to={EPath.root}>
              <p className="text-[#035acb] m-auto font-bold font-stretch-expanded">
                DỊCH AI
              </p>
            </NavLink>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarResponsive"
              aria-controls="navbarResponsive"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
            {/* <Search/> */}
            <div className="navbar-collapse" id="navbarResponsive">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item active">
                  <NavLink className="nav-link" to={EPath.translate}>
                    {({ isActive }) => (
                      <p
                        className={`${
                          isActive ? "text-[#035acb]" : "text-black"
                        } m-auto`}
                      >
                        Dịch văn bản
                      </p>
                    )}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to={EPath.translate_photo}>
                    {({ isActive }) => (
                      <p
                        className={`${
                          isActive ? "text-[#035acb]" : "text-black"
                        } m-auto`}
                      >
                        Dịch hình ảnh
                      </p>
                    )}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to={EPath.translate_document}>
                    {({ isActive }) => (
                      <p
                        className={`${
                          isActive ? "text-[#035acb]" : "text-black"
                        } m-auto`}
                      >
                        Dịch tài liệu
                      </p>
                    )}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to={EPath.translate_chat}>
                    {({ isActive }) => (
                      <p
                        className={`${
                          isActive ? "text-[#035acb]" : "text-black"
                        } m-auto`}
                      >
                        Trò chuyện
                      </p>
                    )}
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <header>
          <div
            id="carouselExampleCaptions"
            className="carousel slide"
            data-bs-ride="carousel"
          >
            <div className="carousel-indicators">
              <button
                type="button"
                data-bs-target="#carouselExampleCaptions"
                data-bs-slide-to={0}
                className="active"
                aria-current="true"
                aria-label="Slide 1"
              />
              <button
                type="button"
                data-bs-target="#carouselExampleCaptions"
                data-bs-slide-to={1}
                aria-label="Slide 2"
              />
              <button
                type="button"
                data-bs-target="#carouselExampleCaptions"
                data-bs-slide-to={2}
                aria-label="Slide 3"
              />
            </div>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#carouselExampleCaptions"
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true" />
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#carouselExampleCaptions"
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true" />
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </header>
      </div>
    </>
  );
};

export default Header;
