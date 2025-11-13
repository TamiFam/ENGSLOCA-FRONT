// src/services/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "https://engsloca-back.onrender.com/api", // твой backend

  withCredentials: true, // <== ключевая опция
});



export default instance;
