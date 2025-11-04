import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing";
import Home from "../pages/Home";
import PaperViewPage from "../pages/PaperViewPage";
import Dashboard from "../components/Home/Dashboard";
import SmartSearch from "../components/Home/SmartSearch";
import MyCollection from "../components/Home/MyCollection";
import ResearchBot from "../components/Home/ResearchBot";
import CollectionPapers from "../components/Home/CollectionPapers";
import VerifyOtpPage from "../components/Landing/VerifyOtpPage";
import OnboardingFormCard from "../components/Onboarding/OnboardingFormCard";
import FullScreenLoader from "../components/FullScreenLoader";
import MyProfile from "../components/Home/MyProfile";

import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import OtpRoute from "./OtpRoute";
import OnboardingRoute from "./OnboardingRoute";

export default function AppRoutes() {
  return (
    <>
      <FullScreenLoader />
      <Routes>
        {/* Public Routes */}
        <Route path="/landing" element={<PublicRoute element={<Landing />} />} />
        <Route path="/verify-otp" element={<OtpRoute element={<VerifyOtpPage />} />} />

        {/* Onboarding Route */}
        <Route path="/on-boarding" element={<OnboardingRoute element={<OnboardingFormCard />} />} />

        {/* Protected App Routes */}
        <Route path="/" element={<PrivateRoute element={<Home />} />}>
          <Route index element={<Dashboard />} />
          <Route path="smart-search" element={<SmartSearch />} />
          <Route path="my-collection" element={<MyCollection />} />
          <Route path="my-collection/:collection_id" element={<CollectionPapers />} />
          <Route path="research-bot" element={<ResearchBot />} />
          <Route path="my-profile" element={<MyProfile />} />
        </Route>

        {/* Public but inside app layout */}
        <Route path="smart-search/:paper_id" element={<PrivateRoute element={<PaperViewPage />} />} />
      </Routes>
    </>
  );
}
