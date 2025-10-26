import { Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Home from "../pages/Home";
import PaperViewPage from "../pages/PaperViewPage"

import Dashboard from "../components/Home/Dashboard";
import SmartSearch from "../components/Home/SmartSearch";
import MyCollection from "../components/Home/MyCollection";
import ResearchBot from "../components/Home/ResearchBot";
import CollectionPapers from "../components/Home/CollectionPapers";
import VerifyOtpPage from "../components/Landing/VerifyOtpPage.tsx";
import FullScreenLoader from "../components/FullScreenLoader";

export default function AppRoutes() {
  return (
    <>
      <FullScreenLoader /> {/* Global loader outside Routes */}
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/" element={<Home />}>
          <Route index element={<Dashboard />} />
          <Route path="smart-search" element={<SmartSearch />} />
          <Route path="my-collection" element={<MyCollection />} />
          <Route path="my-collection/:collection_id" element={<CollectionPapers />} />
          <Route path="research-bot" element={<ResearchBot />} />
        </Route>
        <Route path="smart-search/:paper_id" element={<PaperViewPage />} />
      </Routes>
    </>
  );
}

