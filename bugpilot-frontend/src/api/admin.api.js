import api from "./axiosInstance";

export const adminStatsApi     = ()      => api.get   ("/admin/stats");
export const adminRevenueApi   = ()      => api.get   ("/admin/revenue");
export const adminAiUsageApi   = ()      => api.get   ("/admin/ai-usage");
export const adminUsersApi     = (p)     => api.get   ("/admin/users", { params: p });
export const adminUserDetailApi= (id)    => api.get   (`/admin/users/${id}`);
export const banUserApi        = (id, d) => api.patch (`/admin/users/${id}/ban`,  d);
export const unbanUserApi      = (id)    => api.patch (`/admin/users/${id}/unban`);
export const updatePlanApi     = (id, d) => api.patch (`/admin/users/${id}/plan`, d);
export const deleteUserApi     = (id)    => api.delete(`/admin/users/${id}`);