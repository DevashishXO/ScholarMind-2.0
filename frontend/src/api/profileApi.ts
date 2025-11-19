import apiClient from "./client";
import { type FormData } from "../../lib/types";

export async function createProfile(payload: FormData) {
  const res = await apiClient.post("/profile", {
    ...payload,
    onboardingComplete: true,
    onboardingStep: 5
  });
  return res.data;
}
