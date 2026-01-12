// src/services/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api", // твой backendhttp://localhost:5000/api

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
