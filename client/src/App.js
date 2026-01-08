import "./App.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import PageNotFound from "./pages/PageNotFound";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import SelectAllergens from "./pages/SelectAllergens";
import DietPreferences from "./pages/DietPreferences";
import Settings from "./pages/Settings";

import { AuthContext } from "./helpers/AuthContext";
import { LanguageContext } from "./helpers/LanguageContext";

import { useState, useEffect, useContext } from "react";
import axios from "axios";

// Text cho navbar theo từng ngôn ngữ
const NAV_TEXT = {
  en: {
    login: "Login",
    register: "Registration",
    home: "Home",
    selectAllergens: "Select Allergens",
    dietPreferences: "Diet Preferences",
    logout: "Logout",
    settings: "Settings",
  },
  vi: {
    login: "Đăng nhập",
    register: "Đăng ký",
    home: "Trang chủ",
    selectAllergens: "Chọn dị ứng",
    dietPreferences: "Chế độ ăn",
    logout: "Đăng xuất",
    settings: "Cài đặt",
  },
};

//kkang322005
function App() {
  const [authState, setAuthState] = useState({
    username: "",
    id: 0,
    status: false,
  });

  const { lang } = useContext(LanguageContext);
  const t = NAV_TEXT[lang] || NAV_TEXT.en;

  useEffect(() => {
    axios
      .get("http://localhost:3001/auth/auth", {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        if (response.data.error) {
          setAuthState({ ...authState, status: false });
        } else {
          setAuthState({
            username: response.data.username,
            id: response.data.id,
            status: true,
          });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAuthState({
      username: "",
      id: 0,
      status: false,
    });
  };

  return (
    <div className="App">
      <AuthContext.Provider value={{ authState, setAuthState }}>
        <Router>
          <div className="navbar">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="navbarLogo"
            />
            <div className="links">
              {!authState.status ? (
                <>
                  <Link to="/login"> {t.login}</Link>
                  <Link to="/registration"> {t.register}</Link>
                </>
              ) : (
                <>
                  <Link to="/"> {t.home}</Link>
                  {/* <Link to="/createpost"> Create A Post</Link> */}
                  <Link to="/select-allergens"> {t.selectAllergens}</Link>
                  <Link to="/diet-preferences"> {t.dietPreferences}</Link>
                </>
              )}
              {/* Link tới trang cài đặt luôn hiển thị */}
              <Link to="/settings"> {t.settings}</Link>
            </div>
            <div className="loggedInContainer">
              <Link to={`/profile/${authState.id}`}>{authState.username}</Link>
              {authState.status && (
                <button onClick={logout}> {t.logout}</button>
              )}
            </div>
          </div>
          <Routes>
            <Route path="/" exact element={<Home />} />
            {/* <Route path="/createpost" exact element={<CreatePost />} /> */}
            {/* <Route path="/post/:id" exact element={<Post />} /> */}
            <Route path="/registration" exact element={<Registration />} />
            <Route path="/login" exact element={<Login />} />
            <Route path="/profile/:id" exact element={<Profile />} />
            <Route path="/changepassword" exact element={<ChangePassword />} />
            <Route
              path="/select-allergens"
              exact
              element={<SelectAllergens />}
            />
            <Route
              path="/diet-preferences"
              exact
              element={<DietPreferences />}
            />
            <Route path="/settings" exact element={<Settings />} />
            <Route path="/*" exact element={<PageNotFound />} />
          </Routes>
        </Router>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
