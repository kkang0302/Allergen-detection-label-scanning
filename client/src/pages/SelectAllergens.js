import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import { LanguageContext } from "../helpers/LanguageContext";

const TEXT = {
  en: {
    title: "Select allergens you are concerned about:",
    infoTitle: "Allergen Info",
    noDescription: "No description available.",
    selectToView: "Select an allergen to see its description.",
  },
  vi: {
    title: "Chọn các tác nhân dị ứng bạn quan tâm:",
    infoTitle: "Thông tin dị ứng",
    noDescription: "Chưa có mô tả.",
    selectToView: "Chọn một dị ứng để xem mô tả.",
  },
};

// Map tên allergen trong DB -> label hiển thị đa ngôn ngữ
// Key phải khớp với trường `name` trong bảng Allergens
const ALLERGEN_LABELS = {
  Milk: {
    en: "Milk",
    vi: "Sữa",
  },
  Egg: {
    en: "Egg",
    vi: "Trứng",
  },
  Peanut: {
    en: "Peanut",
    vi: "Đậu phộng, lạc",
  },
  Soybean: {
    en: "Soybean",
    vi: "Đậu nành, đậu tương",
  },
  Wheat: {
    en: "Wheat",
    vi: "Lúa mì",
  },
  Fish: {
    en: "Fish",
    vi: "Cá",
  },
  Shellfish: {
    en: "Shellfish",
    vi: "Thủy sản có vỏ",
  },
  Beef: {
    en: "Beef",
    vi: "Thịt bò",
  },
  Pork: {
    en: "Pork",
    vi: "Thịt heo",
  },
  Alcohol: {
    en: "Alcohol",
    vi: "Rượu, cồn",
  },
  Gluten: {
    en: "Gluten",
    vi: "Gluten",
  },
  Sesame:{
    en: "Sesame",
    vi: "Mè, vừng",
  }
  // nếu sau này bạn thêm allergen mới, chỉ cần bổ sung thêm key ở đây
};

// Hàm lấy label hiển thị theo ngôn ngữ
const getAllergenLabel = (allergen, lang) => {
  if (!allergen) return "";
  const config = ALLERGEN_LABELS[allergen.name];
  if (!config) {
    // Không có trong map thì trả lại tên gốc từ DB
    return allergen.name;
  }
  if (lang === "vi") {
    return config.vi || config.en || allergen.name;
  }
  return config.en || allergen.name;
};

function SelectAllergens() {
  const [allergens, setAllergens] = useState([]);
  const [selected, setSelected] = useState([]);
  const [lastSelected, setLastSelected] = useState(null);
  const { authState } = useContext(AuthContext);
  const { lang } = useContext(LanguageContext);
  const t = TEXT[lang] || TEXT.en;

  useEffect(() => {
    axios.get("http://localhost:3001/allergens").then((res) => {
      setAllergens(res.data);
    });
    if (authState.id) {
      axios
        .get(`http://localhost:3001/userAllergens/${authState.id}`)
        .then((res) => {
          setSelected(res.data.map((a) => a.id));
        });
    }
  }, [authState.id]);

  const handleChange = (id) => {
    setLastSelected(id);
    if (selected.includes(id)) {
      axios
        .delete("http://localhost:3001/userAllergens", {
          data: { userId: authState.id, allergenId: id },
        })
        .then(() => {
          setSelected(selected.filter((item) => item !== id));
        });
    } else {
      axios
        .post("http://localhost:3001/userAllergens", {
          userId: authState.id,
          allergenId: id,
        })
        .then(() => {
          setSelected([...selected, id]);
        });
    }
  };

  const selectedAllergen = allergens.find((a) => a.id === lastSelected);

  return (
    <div className="selectAllergensGrid">
      <div className="selectAllergensList">
        <h2>{t.title}</h2>
        <ul>
          {allergens.map((allergen) => (
            <li key={allergen.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selected.includes(allergen.id)}
                  onChange={() => handleChange(allergen.id)}
                />
                <span
                  className={`allergenName${
                    lastSelected === allergen.id ? " allergenNameSelected" : ""
                  }`}
                  onClick={() => setLastSelected(allergen.id)}
                >
                  {getAllergenLabel(allergen, lang)}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="selectAllergensInfo">
        <h2>{t.infoTitle}</h2>
        {selectedAllergen ? (
          <div>
            <h3>{getAllergenLabel(selectedAllergen, lang)}</h3>
            <p>{selectedAllergen.description || t.noDescription}</p>
            {selectedAllergen && (
              <img
                src={`/images/allergens/${selectedAllergen.name
                  .toLowerCase()
                  .replace(/ /g, "_")}.jpg`}
                alt={selectedAllergen.name}
                className="allergenInfoImage"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
          </div>
        ) : (
          <p>{t.selectToView}</p>
        )}
      </div>
    </div>
  );
}

export default SelectAllergens;
