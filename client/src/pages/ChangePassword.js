// src/pages/ChangePassword.js
import React, { useState, useContext } from "react";
import axios from "axios";
import { LanguageContext } from "../helpers/LanguageContext";

const TEXT = {
  en: {
    title: "Change Password",
    oldPlaceholder: "Old Password",
    newPlaceholder: "New Password",
    saveButton: "Save Changes",
    fillAll: "Please fill in all fields",
    changed: "Password changed successfully",
  },
  vi: {
    title: "Đổi mật khẩu",
    oldPlaceholder: "Mật khẩu cũ",
    newPlaceholder: "Mật khẩu mới",
    saveButton: "Lưu thay đổi",
    fillAll: "Vui lòng điền đầy đủ thông tin",
    changed: "Đổi mật khẩu thành công",
  },
};

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { lang } = useContext(LanguageContext);
  const t = TEXT[lang] || TEXT.en;

  const changePassword = () => {
    if (oldPassword === "" || newPassword === "") {
      alert(t.fillAll);
      return;
    }
    axios
      .put(
        "http://localhost:3001/auth/changepassword",
        {
          oldPassword: oldPassword,
          newPassword: newPassword,
        },
        {
          headers: { accessToken: localStorage.getItem("accessToken") },
        }
      )
      .then((response) => {
        if (response.data.error) {
          alert(response.data.error);
        } else {
          alert(t.changed);
        }
      });
  };

  return (
    <div className="formLayer" style={{ marginTop: "40px" }}>
      <h1>{t.title}</h1>
      <input
        type="password"
        placeholder={t.oldPlaceholder}
        onChange={(event) => setOldPassword(event.target.value)}
      />
      <input
        type="password"
        placeholder={t.newPlaceholder}
        onChange={(event) => setNewPassword(event.target.value)}
      />
      <button onClick={changePassword}>{t.saveButton}</button>
    </div>
  );
}

export default ChangePassword;
