import api from "./axiosInstance";

export const analyzeApi    = (fd) => api.post("/debug/analyze", fd, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const historyApi    = (p)  => api.get("/debug/history",  { params: p });
export const debugStatsApi = ()   => api.get("/debug/stats");
export const getSessionApi = (id) => api.get(`/debug/${id}`);
export const deleteDebugApi= (id) => api.delete(`/debug/${id}`);