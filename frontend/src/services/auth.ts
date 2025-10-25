import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "./api";

export interface SendOtpPayload {
  email: string;
  name?: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  is_verified: boolean;
  google_id?: string;
}

// Check if email exists
export const useCheckEmail = () =>
  useMutation<boolean, Error, string>({
    mutationFn: (email: string) =>
      api.post("/api/v1/auth/check-email", { email }).then(res => res.data.exists),
  });

// Send OTP
export const useSendOtp = () =>
  useMutation<{ ok: boolean; message: string }, Error, SendOtpPayload>({
    mutationFn: (payload: SendOtpPayload) =>
      api.post("/api/v1/auth/send-otp", payload).then(res => res.data),
  });

// Verify OTP
export const useVerifyOtp = () =>
  useMutation<{ ok: boolean; email: string }, Error, VerifyOtpPayload>({
    mutationFn: (payload: VerifyOtpPayload) =>
      api.post("/api/v1/auth/verify-otp", payload).then(res => res.data),
  });

// Logout
export const useLogout = () =>
  useMutation<{ ok: boolean }, Error>({
    mutationFn: () =>
      api.post("/api/v1/auth/logout").then(res => res.data),
  });

// Fetch logged-in user
export const useMe = () =>
  useQuery<User, Error>(
    ["me"],
    async () => {
      const { data } = await api.get("/api/v1/auth/me");
      return data;
    },
    {
      retry: false, // do not retry if not authenticated
      refetchOnWindowFocus: false,
    }
  );
