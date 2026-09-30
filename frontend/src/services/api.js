import axios from "axios";

const api = axios.create({
  baseURL: "https://ssb-gagak-muda-web-slvs.vercel.app/api",
});

export default api;