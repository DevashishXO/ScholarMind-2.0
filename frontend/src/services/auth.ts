import { useMutation, useQuery } from "@tanstack/react-query";
import { checkEmail, sendOtp, verifyOtp, fetchMe, logout } from "../api/authApi";

export const useCheckEmail = () => {
  return useMutation({
    mutationFn: (email: string) => checkEmail(email),
  });
};

export const useSendOtp = () => {
  return useMutation({
    mutationFn: (payload: { email: string }) => sendOtp(payload.email),
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (payload: { email: string; otp: string }) =>
      verifyOtp(payload.email, payload.otp),
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logout,
  });
};
