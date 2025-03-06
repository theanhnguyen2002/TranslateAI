import style from "./style.module.scss";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from "../page/HomePage";

function App() {
  return (
    <div className={style.App}>
      {/* <Header></Header>
      <div className="">
        <Search/>
      </div>
      <div className={style.App_header}>
        <a
          className={style.App_link}
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Home page
          <Outlet/>
        </a>
      </div>
      <Footer></Footer> */}
      <HomePage />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
