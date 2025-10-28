import { Navigate } from "react-router-dom";

export default function OtpRoute({ element }: { element: JSX.Element }) {
  const pendingEmail = localStorage.getItem("pendingEmail");

  // If no OTP was triggered, deny access
  if (!pendingEmail) return <Navigate to="/landing" replace />;

  return element;
}
