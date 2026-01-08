// src/pages/Profile.js
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import { LanguageContext } from "../helpers/LanguageContext";

const TEXT = {
  en: {
    username: "Username",
    changePassword: "Change Password",
    scanHistory: "Scan History:",
    noHistory: "No scan history yet.",
    unknownTime: "Unknown time",
    detectedAllergens: "Detected allergens:",
    noneDetected: "No allergens detected in this scan.",
  },
  vi: {
    username: "Tên người dùng",
    changePassword: "Đổi mật khẩu",
    scanHistory: "Lịch sử quét:",
    noHistory: "Chưa có lịch sử quét.",
    unknownTime: "Không rõ thời gian",
    detectedAllergens: "Các dị ứng phát hiện:",
    noneDetected: "Không phát hiện dị ứng trong lần quét này.",
  },
};

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [userAllergens, setUserAllergens] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);

  const { authState } = useContext(AuthContext);
  const { lang } = useContext(LanguageContext);
  const t = TEXT[lang] || TEXT.en;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Lấy thông tin cơ bản của user
        const basicInfoRes = await axios.get(
          `http://localhost:3001/auth/basicinfo/${id}`
        );
        setUsername(basicInfoRes.data.username || "");
        // lấy lịch sử scan nếu có
        setScanHistory(basicInfoRes.data.scannedLabels || []);

        // Lấy danh sách allergen mà user quan tâm
        const allergensRes = await axios.get(
          `http://localhost:3001/userAllergens/${id}` // chú ý A hoa
        );
        setUserAllergens(allergensRes.data || []);
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };

    fetchProfile();
  }, [id]);

  const isOwnProfile = authState.id === Number(id);

  return (
    <div className="profilePageContainer">
      <div className="basicInfo">
        <h1>
          {t.username}: {username}
        </h1>

        {isOwnProfile && (
          <button
            onClick={() => {
              navigate("/changepassword");
            }}
          >
            {t.changePassword}
          </button>
        )}

        {/* Nếu sau này muốn hiển thị allergens của user thì bật lại
        <div className="userAllergens">
          <h3>Allergens you are concerned about:</h3>
          <ul>
            {userAllergens.length === 0 ? (
              <li>No allergens selected.</li>
            ) : (
              userAllergens.map((a) => <li key={a.id}>{a.name}</li>)
            )}
          </ul>
        </div> */}

        {/* Lịch sử quét nhãn + tác nhân dị ứng đã phát hiện */}
        <div className="scanHistory">
          <h3>{t.scanHistory}</h3>
          {scanHistory.length === 0 ? (
            <p>{t.noHistory}</p>
          ) : (
            <ul>
              {scanHistory
                .slice()
                .reverse() // scan mới nhất lên đầu
                .map((item, index) => (
                  <li key={index} style={{ marginBottom: "12px" }}>
                    <strong>
                      {item.time
                        ? new Date(item.time).toLocaleString()
                        : t.unknownTime}
                    </strong>

                    {item.labelText && (
                      <p>
                        <em>
                          {item.labelText.length > 120
                            ? item.labelText.slice(0, 120) + "..."
                            : item.labelText}
                        </em>
                      </p>
                    )}

                    {Array.isArray(item.detectedAllergens) &&
                    item.detectedAllergens.length > 0 ? (
                      <p>
                        {t.detectedAllergens}{" "}
                        {item.detectedAllergens.map((a) => a.name).join(", ")}
                      </p>
                    ) : (
                      <p>{t.noneDetected}</p>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
