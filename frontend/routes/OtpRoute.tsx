import { Navigate } from "react-router-dom";

export default function OtpRoute({ element }: { element: JSX.Element }) {
  const pendingEmail = localStorage.getItem("pendingEmail");
  const authType = localStorage.getItem("authType");
  
  if(authType === "google") {
    return element
  }

  // If no OTP was triggered and no auth type, deny access 
  if (!pendingEmail ) return <Navigate to="/landing" replace />;

  return element;
}
