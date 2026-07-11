// Central API base URL — reads from env in production, falls back to localhost in dev
const API_BASE = import.meta.env.VITE_API_URL || "https://k-finance-server.onrender.com";

export default API_BASE;
