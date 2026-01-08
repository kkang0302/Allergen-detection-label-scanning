// src/pages/PageNotFound.js
import { Link } from "react-router-dom";
import { useContext } from "react";
import { LanguageContext } from "../helpers/LanguageContext";

const TEXT = {
  en: {
    title: "Page Not Found :/",
    back: "Go to Home Page",
    home: "Home Page",
  },
  vi: {
    title: "Không tìm thấy trang :/",
    back: "Quay về trang chủ:",
    home: "Trang chủ",
  },
};

function PageNotFound() {
  const { lang } = useContext(LanguageContext);
  const t = TEXT[lang] || TEXT.en;

  return (
    <div className="formLayer" style={{ marginTop: "40px" }}>
      <h1>{t.title}</h1>
      <h3>
        {t.back} <Link to="/"> {t.home}</Link>
      </h3>
    </div>
  );
}

export default PageNotFound;
