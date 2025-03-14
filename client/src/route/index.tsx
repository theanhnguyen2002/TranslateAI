import { Suspense, lazy } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import style from "./style.module.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EPath } from "./route";
const HomePage = lazy(() => import("../page/HomePage/index"));
const TranslatePage = lazy(() => import("../page/TranslatePage/index"));
const TranslatePhotoPage = lazy(() => import("../page/TranslatePhotoPage/index"));
const TranslateDocumentPage = lazy(() => import("../page/TranslateDocumentPage/index"));
const TranslateChatPage = lazy(() => import("../page/TranslatePhotoPage/index"));



function App() {
  return (
    <div className={style.App}>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path={EPath.root} element={<HomePage />} />
            <Route path={EPath.translate} element={<TranslatePage />} />
            <Route path={EPath.translate_photo} element={<TranslatePhotoPage />} />
            <Route path={EPath.translate_document} element={<TranslateDocumentPage />} />
            <Route path={EPath.translate_chat} element={<TranslateChatPage />} />
          </Routes>
        </Suspense>
      </Router>
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
