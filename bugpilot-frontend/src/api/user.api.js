import api from "./axiosInstance";

export const getProfileApi   = ()   => api.get("/user/profile");
export const updateProfileApi= (fd) => api.patch("/user/profile", fd, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const getUserStatsApi = ()   => api.get("/user/stats");
export const getUserHistoryApi=(p)  => api.get("/user/history", { params: p });
export const getPlanApi      = ()   => api.get("/user/plan");
export const deleteAccountApi= (d)  => api.delete("/user/account", { data: d });