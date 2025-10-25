// src/components/AuthBox.tsx
import { useState } from "react";
import { useSendOtp } from "../../src/services/auth";

type Props = {
  onGoogleLogin: () => void;
  onEmailSignup: (email: string) => void;
};

export default function AuthBox({ onGoogleLogin, onEmailSignup }: Props) {
  const [email, setEmail] = useState("");
  const sendOtpMutation = useSendOtp();

  const handleEmailSubmit = async () => {
    try {
      await sendOtpMutation.mutateAsync({ email });
      onEmailSignup(email);
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
    }
  };

  return (
    <div className="border border-gray-400 text-[var(--color-light)] p-6 mt-6 rounded-2xl shadow-md bg-[var(--color-gray)] backdrop-blur-sm w-full">
      <button
        className="flex items-center justify-center gap-1 w-full border border-gray-400 rounded-md py-2 text-center hover:bg-neutral-900 hover:text-white transition duration-300"
        onClick={onGoogleLogin}
      >
        <img src="/icons8-google-logo-48.png" alt="Google Logo" className="w-8 h-8" />
        <div className="font-bungee">Continue with Google</div>
      </button>

      <p className="text-center text-gray-300 mt-4">or</p>

      <div className="flex flex-col gap-3 mt-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="border border-gray-400 rounded-md px-3 py-2 bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)] transition"
        />
        <button
          className="bg-[var(--color-orange)] font-bungee rounded-md px-3 py-2 text-white font-semibold hover:bg-[var(--color-light)] hover:text-[var(--color-gray)] transition duration-300"
          onClick={handleEmailSubmit}
          disabled={sendOtpMutation.isLoading}
        >
          {sendOtpMutation.isLoading ? "Sending..." : "Sign Up"}
        </button>
      </div>
    </div>
  );
}
