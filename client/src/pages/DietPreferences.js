// src/pages/DietPreferences.js
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import { LanguageContext } from "../helpers/LanguageContext";

// Diet list (id + base label for image/name)
const DIETS = [
  { id: "Keto", label: "Keto" },
  { id: "Vegan", label: "Vegan" },
  { id: "Pescatarian", label: "Pescatarian" },
  { id: "Halal", label: "Halal" },
  { id: "Low-Carb", label: "Low-Carb" },
  { id: "Gluten-Free", label: "Gluten-Free" },
];

// Map diet → allergens that should be auto-selected
const DIET_ALLERGEN_MAP = {
  Vegan: ["Egg", "Meat", "Honey", "Milk", "Fish", "Shellfish"],
  Pescatarian: ["Meat"],
  Halal: ["Pork", "Alcohol", "Gelatin"],
  Keto: ["Sugar", "Wheat", "Rice", "Bread", "Pasta"],
  "Low-Carb": ["Sugar", "Wheat", "Rice", "Bread", "Pasta"],
  "Gluten-Free": ["Gluten", "Wheat", "Rice", "Bread", "Pasta"],
};

// UI text by language
const TEXT = {
  en: {
    title: "Diet Preferences",
    subtitle: "Choose diet styles you follow or are interested in.",
    listTitle: "Diet List",
    infoTitle: "Diet Information",
    saveButton: "Save Preferences",
    savedTitle: "Saved:",
    selectToView: "Select a diet to view detailed information.",
  },
  vi: {
    title: "Chọn chế độ ăn",
    subtitle: "Chọn các chế độ ăn bạn đang theo hoặc quan tâm.",
    listTitle: "Danh sách chế độ ăn",
    infoTitle: "Thông tin chế độ ăn",
    saveButton: "Lưu chế độ ăn",
    savedTitle: "Đã lưu:",
    selectToView: "Chọn chế độ ăn để xem thông tin chi tiết.",
  },
};

// Diet descriptions by language
const DIET_DESCRIPTIONS = {
  en: {
    Keto:
      "A low-carbohydrate, high-fat diet that focuses on reducing carbs to push the body into a fat-burning state (ketosis).",
    Vegan:
      "A plant-based diet that excludes all animal products, including meat, eggs, dairy, honey, and all animal-derived ingredients.",
    Pescatarian:
      "A diet that excludes meat from land animals but allows fish and seafood alongside plant-based foods.",
    Halal:
      "A diet following Islamic dietary laws: excludes pork, alcohol, non-Halal meat, and certain animal-derived ingredients.",
    "Low-Carb":
      "A diet that reduces carbohydrate intake, focusing mainly on protein, vegetables, and healthy fats.",
    "Gluten-Free":
      "A diet that avoids gluten proteins found in wheat, barley, rye, and related grains; suitable for gluten intolerance or celiac disease.",
  },
  vi: {
    Keto:
      "Chế độ ăn ít tinh bột, nhiều chất béo, giảm mạnh lượng carb để cơ thể chuyển sang trạng thái đốt mỡ (ketosis).",
    Vegan:
      "Chế độ ăn thuần chay, chỉ dùng thực vật, loại bỏ hoàn toàn thịt, trứng, sữa, mật ong và các sản phẩm có nguồn gốc từ động vật.",
    Pescatarian:
      "Chế độ ăn không dùng thịt động vật trên cạn nhưng vẫn ăn cá, hải sản kết hợp với thực phẩm có nguồn gốc thực vật.",
    Halal:
      "Chế độ ăn tuân theo luật Hồi giáo: không dùng thịt heo, rượu và các loại thịt/nguồn gốc động vật không đạt chuẩn Halal.",
    "Low-Carb":
      "Chế độ ăn giảm tinh bột, tập trung vào đạm, rau củ và chất béo lành mạnh.",
    "Gluten-Free":
      "Chế độ ăn không chứa gluten - nhóm protein có trong lúa mì, lúa mạch, lúa mạch đen; phù hợp cho người không dung nạp gluten.",
  },
};

// Vietnamese labels for diets (for display)
const DIET_LABEL_VI = {
  Keto: "Keto",
  Vegan: "Thuần chay (Vegan)",
  Pescatarian: "Pescatarian (không thịt đỏ, có cá)",
  Halal: "Halal",
  "Low-Carb": "Ít tinh bột (Low-Carb)",
  "Gluten-Free": "Không gluten (Gluten-Free)",
};

// image path helper
const getDietImagePath = (name) =>
  `/images/diets/${name.toLowerCase().replace(/ /g, "_")}.jpg`;

function DietPreferences() {
  const [selected, setSelected] = useState([]);
  const [activeDiet, setActiveDiet] = useState(DIETS[0].id);
  const { authState } = useContext(AuthContext);
  const { lang } = useContext(LanguageContext);

  const text = TEXT[lang] || TEXT.en;

  useEffect(() => {
    const saved = localStorage.getItem("dietPreferences");
    if (saved) {
      const arr = JSON.parse(saved);
      setSelected(arr);
      if (arr.length > 0) setActiveDiet(arr[0]);
    }
  }, []);

  const toggle = (dietId) => {
    setSelected((prev) => {
      if (prev.includes(dietId)) {
        return prev.filter((d) => d !== dietId);
      }
      return [...prev, dietId];
    });
    setActiveDiet(dietId);
  };

  const save = async () => {
    localStorage.setItem("dietPreferences", JSON.stringify(selected));
    // giữ nguyên alert tiếng Anh từ backend nếu muốn, hoặc thêm theo lang
    alert(lang === "vi" ? "Đã lưu chế độ ăn." : "Diet preferences saved.");

    if (!authState.id) return;

    try {
      const res = await axios.get("http://localhost:3001/allergens");
      const allAllergens = res.data;

      const allergenNameSet = new Set();
      selected.forEach((dietId) => {
        const names = DIET_ALLERGEN_MAP[dietId] || [];
        names.forEach((n) => allergenNameSet.add(n));
      });

      const allergensToAdd = allAllergens.filter((a) =>
        allergenNameSet.has(a.name)
      );

      for (const allergen of allergensToAdd) {
        try {
          await axios.post("http://localhost:3001/userAllergens", {
            userId: authState.id,
            allergenId: allergen.id,
          });
        } catch (err) {
          console.log("skip existing allergen", allergen.name);
        }
      }
    } catch (err) {
      console.error("Error syncing diet -> allergens", err);
    }
  };

  const currentInfo = DIETS.find((d) => d.id === activeDiet);

  const getDietLabel = (diet) => {
    if (lang === "vi") {
      return DIET_LABEL_VI[diet.id] || diet.label;
    }
    return diet.label;
  };

  const getDietDescription = (dietId) => {
    const descByLang = DIET_DESCRIPTIONS[lang] || DIET_DESCRIPTIONS.en;
    return descByLang[dietId] || "";
  };

  return (
    <div className="dietPreferences">
      <h2 className="dietTitle">{text.title}</h2>
      <p className="dietSubtitle">{text.subtitle}</p>

      <div className="dietGrid">
        {/* LEFT COLUMN */}
        <div className="dietList">
          <h3>{text.listTitle}</h3>
          <ul>
            {DIETS.map((diet) => (
              <li key={diet.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected.includes(diet.id)}
                    onChange={() => toggle(diet.id)}
                  />
                  <span
                    className={
                      "dietLabel" +
                      (activeDiet === diet.id ? " dietLabelSelected" : "")
                    }
                    onClick={() => setActiveDiet(diet.id)}
                  >
                    {getDietLabel(diet)}
                  </span>
                </label>
              </li>
            ))}
          </ul>

          {/* save + saved section stays on the left */}
          <div className="dietActions">
            <button onClick={save} className="dietSave">
              {text.saveButton}
            </button>
          </div>

          {selected.length > 0 && (
            <div className="dietSaved">
              <strong>{text.savedTitle}</strong>
              <ul>
                {selected.map((s) => (
                  <li key={s}>
                    {lang === "vi"
                      ? DIET_LABEL_VI[s] || s
                      : s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="dietInfo">
          <h3>{text.infoTitle}</h3>
          {currentInfo ? (
            <>
              <h4>{getDietLabel(currentInfo)}</h4>
              <p>{getDietDescription(currentInfo.id)}</p>
              <img
                src={getDietImagePath(currentInfo.label)}
                alt={currentInfo.label}
                className="dietInfoImage"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </>
          ) : (
            <p>{text.selectToView}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DietPreferences;
