import api from "./axiosInstance";

export const createOrderApi   = (d) => api.post  ("/payment/order",  d);
export const verifyPaymentApi = (d) => api.post  ("/payment/verify", d);
export const getBillingApi    = ()  => api.get   ("/payment/billing");
export const cancelSubApi     = ()  => api.delete("/payment/cancel");