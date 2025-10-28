import { Navigate } from "react-router-dom";
import { useAuth } from "../src/hooks/useAuth";

export default function PrivateRoute({ element }: { element: JSX.Element }) {
  const { loading, data } = useAuth();

  if (loading) return <div>Loading...</div>;

  // Not logged in → go to landing
  if (!data?.user) return <Navigate to="/landing" replace />;

  // OTP not verified
  if (!data?.otpVerified) return <Navigate to="/verify-otp" replace />;

  // Onboarding not done
  // if (!data?.onboardingComplete) return <Navigate to="/on-boarding" replace />;

  return element;
}
