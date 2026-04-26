import api from "./axiosInstance";

export const registerApi       = (d) => api.post("/auth/register",        d);
export const verifyOtpApi      = (d) => api.post("/auth/verify-otp",      d);
export const resendOtpApi      = (d) => api.post("/auth/resend-otp",      d);
export const loginApi          = (d) => api.post("/auth/login",           d);
export const logoutApi         = ()  => api.post("/auth/logout");
export const getMeApi          = ()  => api.get ("/auth/me");
export const refreshApi        = ()  => api.post("/auth/refresh-token");
export const forgotPasswordApi = (d) => api.post("/auth/forgot-password", d);
export const resetPasswordApi  = (d) => api.post("/auth/reset-password",  d);
export const changePasswordApi = (d) => api.post("/auth/change-password", d);