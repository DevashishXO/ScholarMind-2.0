import { useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useLoading } from "../../src/context/LoadingContext";

type Props = {
  onGoogleLogin: (email: string) => void;
  onEmailSignup: (email: string) => void;
  emailLoading?: boolean;
};

export default function AuthBox({ onGoogleLogin, onEmailSignup, emailLoading }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const { loading, setLoading } = useLoading();

  const handleGoogleClick = () => {
    setGoogleLoading(true);
    onGoogleLogin(email);
  };

  const handleEmailSubmit = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }
    
    setError("");
    setLoading(true);
    try {
      onEmailSignup(email);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-400 text-[var(--color-light)] p-6 mt-6 rounded-2xl shadow-md bg-[var(--color-gray)] backdrop-blur-sm w-full relative">
      {/* Google Button */}
      <button
        disabled={googleLoading}
        className="flex items-center justify-center gap-2 w-full border border-gray-400 rounded-md py-2 hover:bg-neutral-900 disabled:opacity-50 transition cursor-pointer"
        onClick={handleGoogleClick}
      >
        {googleLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <img src="/icons8-google-logo-48.png" className="w-6 h-6" />}
        {googleLoading ? "Redirecting..." : "Continue with Google"}
      </button>

      <p className="text-center text-gray-300 mt-4">or</p>

      {/* Email Input */}
      <div className="flex flex-col gap-4 mt-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="border border-gray-400 rounded-md px-3 py-2 bg-transparent text-white placeholder-gray-300 focus:outline-none"
        />
        {error && <span className="text-red-500 text-sm">{error}</span>}

        <button
          disabled={emailLoading || loading}
          className="flex justify-center items-center gap-2 bg-[var(--color-orange)] font-bungee rounded-md py-2 hover:bg-[var(--color-light)] hover:text-[var(--color-gray)] disabled:opacity-60 transition cursor-pointer"
          onClick={handleEmailSubmit}
        >
          {emailLoading || loading ? <Loader2 className="animate-spin w-5 h-5" /> : null}
          {emailLoading || loading ? "Checking..." : "Sign Up"}
        </button>
      </div>
    </div>
  );
}
