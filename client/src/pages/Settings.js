// src/pages/Settings.js
import React, { useContext } from "react";
import { LanguageContext } from "../helpers/LanguageContext";

function Settings() {
  const { lang, setLang } = useContext(LanguageContext);

  return (
    <div className="formLayer" style={{ marginTop: "40px" }}>
      <h2>Cài đặt / Settings</h2>

      <h3>Ngôn ngữ giao diện (UI Language)</h3>

      <div>
        <label>
          <input
            type="radio"
            value="en"
            checked={lang === "en"}
            onChange={() => setLang("en")}
          />
          English
        </label>
      </div>

      <div>
        <label>
          <input
            type="radio"
            value="vi"
            checked={lang === "vi"}
            onChange={() => setLang("vi")}
          />
          Tiếng Việt
        </label>
      </div>

      <p style={{ marginTop: "20px" }}>
        Giao diện sẽ tự động đổi ngôn ngữ ngay sau khi bạn chọn.
      </p>
    </div>
  );
}

export default Settings;
