import { Navigate } from "react-router-dom";
import { useProfile } from "../src/hooks/useProfile";
import { useAuth } from "../src/hooks/useAuth";

export default function OnboardingRoute({ element }: { element: JSX.Element }) {
  
  const  {loading, data}  = useProfile();
  const  user  = useAuth();
  if (loading) return <div>Loading...</div>;

  // User must be logged in + otpVerified, but NOT finished onboarding
  if (!user?.data?.user) return <Navigate to="/landing" replace />;
  if (!user?.data?.otpVerified) return <Navigate to="/verify-otp" replace />;
  
  if (data?.onboardingComplete) return <Navigate to="/" replace />;

  return element;
}
