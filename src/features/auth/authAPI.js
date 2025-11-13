// src/features/auth/authAPI.js
import axios from "../../services/axios";

// Регистрация
export const registerUser = (data) =>
  axios.post("/auth/register", data, { withCredentials: true });

// Логин
export const loginUser = (data) =>
  axios.post("/auth/login", data, { withCredentials: true });

// Получить текущего пользователя
export const getMe = () =>
  axios.get("/auth/me", { withCredentials: true });

// Логаут
export const logoutUser = () =>
  axios.post("/auth/logout", {}, { withCredentials: true });
