import axios from "axios";

const api = axios.create({
  baseURL: "https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com",
  timeout: 10000,
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
