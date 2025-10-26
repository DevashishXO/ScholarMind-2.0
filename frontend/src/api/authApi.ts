import apiClient from "./client";

export const checkEmail = async (email: string) => {
  const res = await apiClient.post("/auth/check-email", { email });
  return res.data;
};

export const sendOtp = async (email: string) => {
  const res = await apiClient.post("/auth/send-otp", { email });
  return res.data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const res = await apiClient.post("/auth/verify-otp", { email, otp });
  return res.data;
};

export const fetchMe = async () => {
  const res = await apiClient.get("/auth/me");
  return res.data;
};

export const logout = async () => {
  const res = await apiClient.post("/auth/logout");
  return res.data;
};
