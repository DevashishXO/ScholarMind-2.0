import Sidebar from '../components/Home/Sidebar';
import { Outlet } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex max-h-screen w-full text-[var(--color-light)]">
      {/* Sidebar*/}
      <Sidebar />
      {/* Dynamic content based on route */}
      <Outlet />
    </div>
  );
}
