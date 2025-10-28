import { useNavigate } from "react-router-dom";
import AuthBox from "./AuthBox";
import { useCheckEmail } from "../../src/services/auth";
import { useLoading } from "../../src/context/LoadingContext";
import toast from "react-hot-toast";

export default function MidSection() {
  const navigate = useNavigate();
  const checkEmailMutation = useCheckEmail();
  const { setLoading } = useLoading();

  const handleGoogleLogin = (email: string) => {
    const pendingEmail = email;
    localStorage.setItem("pendingEmail", pendingEmail);
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/google/login`;
  };

  const handleEmailSignup = async (email: string) => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    setLoading(true);
    try {
      const response = await checkEmailMutation.mutateAsync(email);

      if (response.exists) {
        // Navigate to OTP page with a flag to indicate OTP should be sent
        const pendingEmail = email;
        localStorage.setItem("pendingEmail", pendingEmail);
        navigate(`/verify-otp?email=${email}&sendOtp=true`);
      } else {
        toast.error("User not found! Signup first or continue with Google.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-w-[80%] min-h-[80vh] grid grid-cols-1 md:grid-cols-2 p-6 md:p-8">
      {/* Left Section */}
      <div className="flex flex-col justify-center items-end px-4 text-[var(--color-gray)]">
        <div className="flex flex-col justify-center items-center w-full max-w-sm">
          <h2 className="text-5xl font-bold bungee-regular text-[var(--color-orange)] leading-tight">Difficult?</h2>
          <h2 className="text-5xl font-bold bungee-regular text-[var(--color-orange)] leading-tight">
            Not <span className="text-[var(--color-light)]">Anymore.</span>
          </h2>
          <p className="text-lg font-semibold text-white mt-4 text-center">Experience the power of AI-driven research.</p>

          <AuthBox
            onGoogleLogin={handleGoogleLogin}
            onEmailSignup={handleEmailSignup}
            emailLoading={checkEmailMutation.isLoading}
          />
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
