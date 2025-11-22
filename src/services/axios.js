// src/services/axios.js
import axios from "axios";

const API_BASE_URL = import.meta.env.PROD 
  ? "https://engsloca-back.onrender.com/api"  // Production
  : "http://localhost:3000/api";               // Development

const instance = axios.create({
  baseURL: API_BASE_URL, // твой backend

  withCredentials: true, // <== ключевая опция
});

instance.interceptors.request.use(
  (config) => {
    if (['post', 'put', 'patch'].includes(config.method)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
