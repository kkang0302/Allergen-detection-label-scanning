// src/helpers/LanguageContext.js
import React, { createContext, useState, useEffect } from "react";

export const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
});

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState("en");

  // Lấy ngôn ngữ lưu trong localStorage (nếu có)
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "vi") {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};
