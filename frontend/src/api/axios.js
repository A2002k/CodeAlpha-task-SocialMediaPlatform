import axios from "axios";

const API = axios.create({
  baseURL: "https://codealpha-task-socialmediaplatform.onrender.com/api",
});

API.interceptors.request.use((req) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;