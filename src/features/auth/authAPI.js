// src/features/auth/authAPI.js
import axios from "../../services/axios";

export const registerUser = (data) =>
  axios.post("/auth/register", data);

export const loginUser = (data) =>
  axios.post("/auth/login", data);

export const getMe = () =>
  axios.get("/auth/me");
