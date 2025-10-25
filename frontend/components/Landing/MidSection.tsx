// components/MidSection.tsx
import { useNavigate } from "react-router-dom";
import AuthBox from "./AuthBox";

export default function MidSection() {
  const navigate = useNavigate();

  // Placeholder handlers — will connect to React Query
  const handleGoogleLogin = () => {
    // Open backend Google OAuth endpoint
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/google/login`;
  };

  const handleEmailSignup = (email: string) => {
    // Call backend send-OTP endpoint via React Query later
    console.log("Signup email:", email);
    navigate(`/verify-otp?email=${email}`);
  };

  return (
    <section className="min-w-[80%] min-h-[80vh] grid grid-cols-1 md:grid-cols-2 p-6 md:p-8">
      {/* Left Section */}
      <div className="flex flex-col justify-center items-end px-4 text-[var(--color-gray)]">
        <div className="flex flex-col justify-center items-center w-full max-w-sm">
          <h2 className="text-5xl font-bold bungee-regular text-[var(--color-orange)] leading-tight">
            Difficult?
          </h2>
          <h2 className="text-5xl font-bold bungee-regular text-[var(--color-orange)] leading-tight">
            Not <span className="text-[var(--color-light)]">Anymore.</span>
          </h2>

          <p className="text-lg font-semibold text-white mt-4 text-center">
            Experience the power of AI-driven research.
          </p>

          {/* Auth Component */}
          <AuthBox onGoogleLogin={handleGoogleLogin} onEmailSignup={handleEmailSignup} />
        </div>
      </div>

      {/* Right Section: Video */}
      <div className="flex justify-center items-center px-4 md:px-8">
        <video
          src="/home_placeholder.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="rounded-2xl shadow-xl w-full max-w-[60%] h-auto object-cover"
        />
      </div>
    </section>
  );
}
