// src/pages/Registration.js
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { LanguageContext } from "../helpers/LanguageContext";

const TEXT = {
  en: {
    usernameLabel: "Username",
    passwordLabel: "Password",
    usernamePlaceholder: "(Ex. Username...)",
    passwordPlaceholder: "(Ex. Password...)",
    registerButton: "Register",
    usernameRequired: "Username is required",
    passwordRequired: "Password is required",
    registerSuccess: "Registration successful!",
    registerFailed: "Registration failed. Please try again.",
  },
  vi: {
    usernameLabel: "Tên đăng nhập",
    passwordLabel: "Mật khẩu",
    usernamePlaceholder: "(Ví dụ: tennguoidung...)",
    passwordPlaceholder: "(Ví dụ: matkhau...)",
    registerButton: "Đăng ký",
    usernameRequired: "Vui lòng nhập tên đăng nhập",
    passwordRequired: "Vui lòng nhập mật khẩu",
    registerSuccess: "Đăng ký thành công!",
    registerFailed: "Đăng ký thất bại. Vui lòng thử lại.",
  },
};

function Registration() {
  const navigate = useNavigate();
  const { lang } = useContext(LanguageContext);
  const t = TEXT[lang] || TEXT.en;

  const initialValues = {
    username: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string().min(3).max(15).required(t.usernameRequired),
    password: Yup.string().min(4).max(20).required(t.passwordRequired),
  });

  const onSubmit = (data, { setSubmitting, resetForm }) => {
    axios
      .post("http://localhost:3001/auth", data)
      .then((response) => {
        if (response.data === "SUCCESS") {
          alert(t.registerSuccess);
          resetForm();
          navigate("/login");
        } else if (response.data.error) {
          alert(response.data.error);
        }
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error) {
          alert(error.response.data.error);
        } else {
          alert(t.registerFailed);
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        enableReinitialize
      >
        <Form className="formContainer">
          <label>{t.usernameLabel}: </label>
          <ErrorMessage name="username" component="span" />
          <Field
            autoComplete="off"
            id="inputCreatePost"
            name="username"
            placeholder={t.usernamePlaceholder}
          />
          <label>{t.passwordLabel}: </label>
          <ErrorMessage name="password" component="span" />
          <Field
            autoComplete="off"
            type="password"
            id="inputCreatePost"
            name="password"
            placeholder={t.passwordPlaceholder}
          />
          <button type="submit"> {t.registerButton}</button>
        </Form>
      </Formik>
    </div>
  );
}

export default Registration;
