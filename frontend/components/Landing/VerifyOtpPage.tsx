import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useVerifyOtp, useSendOtp } from "../../src/services/auth";
import { Loader2 } from "lucide-react";
import { useLoading } from "../../src/context/LoadingContext";
import toast from "react-hot-toast";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const sendOtpFlag = searchParams.get("sendOtp") === "true"; // only send if true
  const navigate = useNavigate();
  const verifyOtpMutation = useVerifyOtp();
  const sendOtpMutation = useSendOtp();
  const [error, setError] = useState("");

  const { setLoading } = useLoading();
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);

  // OTP input handling
  const handleChange = (index: number, value: string) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);
      if (value && index < otp.length - 1) inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Auto-submit when all digits filled
  useEffect(() => {
    if (otp.every((d) => d !== "")) handleSubmit();
  }, [otp]);

  // Only send OTP if coming from email signup
  useEffect(() => {
    if (!sendOtpFlag || !email) return;

    const sendOtp = async () => {
      try {
        const response = await sendOtpMutation.mutateAsync({ email });
        if (response.ok) toast.success("OTP sent successfully!");
      } catch (err: any) {
        toast.error(err?.message || "Failed to send OTP");
      }
    };

    sendOtp();
  }, [sendOtpFlag, email]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}`.padStart(2, "0") + `:${(seconds % 60).toString().padStart(2, "0")}`;

  const handleSubmit = async () => {
    setError("");
    const otpStr = otp.join("");
    if (otpStr.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtpMutation.mutateAsync({ email, otp: otpStr });
      if (response.ok) {
        toast.success("OTP verified successfully!");
        localStorage.removeItem("pendingEmail");
        setTimeout(() => navigate("/on-boarding"), 1000);
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || "Invalid OTP";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      await sendOtpMutation.mutateAsync({ email });
      setOtp(["", "", "", "", "", ""]);
      setTimeLeft(300);
      setCanResend(false);
      inputsRef.current[0]?.focus();
      toast.success("OTP resent successfully!");
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || "Failed to resend OTP";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 px-4">
      <div className="w-full max-w-md bg-[var(--color-gray)] rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-neutral-600">
        <h2 className="text-3xl font-bold text-[var(--color-orange)] text-center mb-6 font-bungee">Verify OTP</h2>

        <div className="flex flex-col items-center mb-6">
          <p className="text-center text-gray-300">Enter the OTP sent to :</p>
          <p className="font-semibold text-white">{email}</p>
        </div>

        <div className="flex justify-between gap-2 mb-4">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el!)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-12 text-center text-[var(--color-light)] bg-neutral-900 rounded-xl border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)] text-xl font-bold transition"
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-[var(--color-orange)] text-white font-semibold hover:bg-[var(--color-light)] hover:text-[var(--color-gray)] transition mb-4 disabled:opacity-50 disabled:cursor-not-allowed font-bungee cursor-pointer flex justify-center items-center gap-2"
          disabled={verifyOtpMutation.isLoading}
        >
          {verifyOtpMutation.isLoading && <Loader2 className="animate-spin h-5 w-5 text-white" />}
          {verifyOtpMutation.isLoading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="flex justify-between items-center text-sm mt-2 text-gray-400">
          <span>Resend OTP in: {formatTime(timeLeft)}</span>
          <button
            className={`text-[var(--color-orange)] font-semibold ${!canResend ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleResend}
          >
            Resend
          </button>
        </div>
      </div>
    </div>
  );
}
