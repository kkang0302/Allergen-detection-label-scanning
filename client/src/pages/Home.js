import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import { LanguageContext } from "../helpers/LanguageContext";
import Tesseract from "tesseract.js";

// Map tên allergen chuẩn -> các từ khoá có thể xuất hiện trên nhãn (Anh + Việt)
const ALLERGEN_KEYWORDS = {
  Milk: ["sữa", "bơ", "phô mai", "ya ua", "kem", "sữa chua", 
    "milk", "butter", "cheese", "yogurt", "cream"],

  Egg: ["trứng", "lòng đỏ", "lòng trắng", "mayonnaise", "egg", "yolk", "mayonnaise"],

  Peanut: ["đậu phộng", "lạc", "đậu phụng", "phụng", "dầu phộng", "dầu phụng", "peanut"],

  Soybean: ["đậu nành", "đỗ tương", "đậu tương", "nước tương", "đậu hũ", "xì dầu", 
    "soy", "tofu", "soybean", "soy sauce"],

  Wheat: ["lúa mì", "bột mì", "wheat"],

  Fish: ["cá", "fish"],

  Shellfish: ["tôm", "cua", "ghẹ", "sò", "nghêu", "ốc", "mực", "bạch tuộc", "hến", "bào ngư", "hải sâm", "bề bề", "rùa",
    "shrimp", "crab", "lobster", "clam", "oyster", "squid", "octopus", "scallop", "abalone", "sea cucumber", "mantis shrimp", "turtle"
],

  Treenut: ["hạnh nhân", "óc chó", "điều", "mắc ca", "macca", "hồ đào", "hạt dẻ", "hạt phỉ",
    "almond", "walnut", "cashew", "macadamia", "pecan", "chestnut", "hazelnut", "pistachio"
  ],

  Sesame: ["mè", "vừng", "dầu mè", "sesame"],

  Alcohol: ["rượu", "bia", "cồn", "beer", "wine", "vodka", "whiskey", "rum", "gin", "alcohol", "ethanol"],

  Gluten: ["bánh mì", "mì", "mỳ", "bún", "phở", 
    "pasta", "noodle", "gluten", "bread"],

  Pork: ["thịt heo", "thịt lợn", "heo", "lợn", "giò", "chả", "xúc xích", "bì", 
    "gelatin", "pork", "porkchop", "bacon", "ham", "sausage"],

  Beef: ["thịt bò", "bò", "beef", "steak", "hamburger"],
};

// Chuẩn hoá chuỗi để tìm kiếm: lowercase + gom khoảng trắng + biến dấu câu thành space
const normalizeForSearch = (str) =>
  (" " + (str || "").toLowerCase() + " ")
    .replace(/[\n\r\t]+/g, " ")
    .replace(/[.,;:()!?/\\[\]-]+/g, " ")
    .replace(/\s+/g, " "); // gom nhiều space thành 1

// textSearch đã normalize sẵn
const textContainsKeyword = (textSearch, keyword) => {
  if (!keyword) return false;
  const kw = normalizeForSearch(keyword).trim();
  if (!kw) return false;
  // thêm space 2 bên để match theo "cụm từ" chứ không dính vào chữ khác
  return textSearch.includes(` ${kw} `);
};


const TEXT = {
  en: {
    title: "Check allergens from label",
    textareaPlaceholder: "Paste label text here...",
    checkButton: "Check Allergens",
    uploadButton: "Upload & Check Allergens",
    detectedTitle: "Detected allergens you are concerned about:",
    noneDetected: "No allergens detected from your selection.",
    processing: "Processing...",
  },
  vi: {
    title: "Kiểm tra dị ứng trong nhãn sản phẩm",
    textareaPlaceholder: "Dán nội dung nhãn vào đây...",
    checkButton: "Kiểm tra dị ứng",
    uploadButton: "Tải ảnh & kiểm tra",
    detectedTitle: "Các dị ứng bạn quan tâm được phát hiện:",
    noneDetected: "Không phát hiện dị ứng nào dựa trên lựa chọn của bạn.",
    processing: "Đang xử lý...",
  },
};

function Home() {
  const { authState } = useContext(AuthContext);
  const { lang } = useContext(LanguageContext);
  const t = TEXT[lang] || TEXT.en;

  let navigate = useNavigate();

  // Allergen detection states
  const [inputText, setInputText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [detectedAllergens, setDetectedAllergens] = useState([]);
  const [userAllergens, setUserAllergens] = useState([]);
  const [ocrLoading, setOcrLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
    } else {
      axios
        .get(`http://localhost:3001/userallergens/${authState.id}`)
        .then((res) => {
          setUserAllergens(res.data);
        });
    }
  }, [authState.id, navigate]);

  const detectAllergensFromText = (text) => {
    if (!text || userAllergens.length === 0) {
      setDetectedAllergens([]);
      return [];
    }

    // chuẩn hoá text chỉ một lần
    const searchText = normalizeForSearch(text);

    console.log("DEBUG text:", text);
    console.log("DEBUG userAllergens:", userAllergens);

    const found = userAllergens.filter((a) => {
      const baseNameRaw = a.name || "";
      const baseName = baseNameRaw.toLowerCase();

      // 1. Thử match trực tiếp tên allergen (vd: "milk")
      if (textContainsKeyword(searchText, baseName)) return true;

      // 2. Thử theo danh sách từ khoá Việt–Anh
      const keywords =
        ALLERGEN_KEYWORDS[baseNameRaw] || ALLERGEN_KEYWORDS[baseName] || [];

      return keywords.some((kw) => textContainsKeyword(searchText, kw));
    });

    setDetectedAllergens(found);
    return found;
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    const found = detectAllergensFromText(inputText);
    await saveScanHistory(inputText, found);
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return;
    setOcrLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const {
        data: { text },
      } = await Tesseract.recognize(reader.result, "eng+vie");
      setInputText(text);
      const found = detectAllergensFromText(text);
      await saveScanHistory(text, found);
      setOcrLoading(false);
    };
    reader.readAsDataURL(imageFile);
  };

  const saveScanHistory = async (text, foundAllergens) => {
    try {
      if (!authState.id) return;

      await axios.post(
        "http://localhost:3001/auth/save-scan",
        {
          labelText: text,
          detectedAllergens: (foundAllergens || []).map((a) => ({
            id: a.id,
            name: a.name,
          })),
        },
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        }
      );
    } catch (err) {
      console.error("Error saving scan history", err);
    }
  };

  return (
    <div className="backgroundLayer">
      <div className="formLayer">
        <h2 className="allergenDetectTitle">{t.title}</h2>
        <form onSubmit={handleTextSubmit} className="allergenDetectForm">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.textareaPlaceholder}
            rows={4}
            className="allergenDetectTextarea"
          />
          <button type="submit" className="allergenDetectButton">
            {t.checkButton}
          </button>
        </form>
        <form onSubmit={handleImageSubmit} className="allergenDetectForm">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="allergenDetectFile"
          />
          <button
            type="submit"
            className="allergenDetectButton"
            disabled={ocrLoading}
          >
            {ocrLoading ? t.processing : t.uploadButton}
          </button>
        </form>
        {detectedAllergens.length > 0 && (
          <div className="allergenResult">
            <h3>{t.detectedTitle}</h3>
            <ul>
              {detectedAllergens.map((a) => (
                <li key={a.id}>{a.name}</li>
              ))}
            </ul>
          </div>
        )}
        {detectedAllergens.length === 0 && inputText && (
          <div className="allergenResult">
            <h3>{t.noneDetected}</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
