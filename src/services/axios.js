// src/services/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "https://engsloca-back.onrender.com/api", // твой backend

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
