import { Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Home from "../pages/Home";
import PaperViewPage from "../pages/PaperViewPage"

import Dashboard from "../components/Home/Dashboard";
import SmartSearch from "../components/Home/SmartSearch";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route path="/" element={<Home />}>
                {/* Nested Routes */}
                <Route index element={<Dashboard />} />
                <Route path="smart-search" element={<SmartSearch />} />
      </Route>
      <Route path="/smart-search/:paper_id" element={<PaperViewPage />}/>
    </Routes>
  );
}
