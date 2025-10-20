import Sidebar from '../components/Home/Sidebar';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';

const tabs = [
  { name: "Dashboard", logoSrc: "/icons8-dashboard-48.png", alt: "Dashboard Logo" },
  { name: "Smart Search", logoSrc: "/icons8-research-50.png", alt: "Smart Search Logo" },
  { name: "My Collections", logoSrc: "/icons8-collectibles-50.png", alt: "My Collections Logo" },
];

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [tabSelected, setTabSelected] = useState("Dashboard");
  
  return (
    <div className="flex max-h-screen w-full text-[var(--color-light)]">
      {/* Sidebar*/}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} tabSelected={tabSelected} setTabSelected={setTabSelected} tabs={tabs}/>
      {/* Dynamic content based on route */}
      <Outlet />
    </div>
  );
}
