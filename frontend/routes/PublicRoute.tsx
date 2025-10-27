import { Navigate } from "react-router-dom";
import { useAuth } from "../src/hooks/useAuth";

export default function PublicRoute({ element }: { element: JSX.Element }) {
  const { loading, data } = useAuth();

  if (loading) return <div>Loading...</div>;

  // If logged in → redirect to dashboard
  if (data?.user) {
    if (!data?.otpVerified) return <Navigate to="/verify-otp" replace />;
    if (!data?.onboardingComplete) return <Navigate to="/on-boarding" replace />;
    return <Navigate to="/" replace />;
  }

  return element;
}
