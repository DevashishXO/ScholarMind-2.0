import Sidebar from '../components/Home/Sidebar';
import { Outlet } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full text-[var(--color-light)]">
      {/* Sidebar*/}
      <Sidebar />

      {/* Dynamic content based on route */}
      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
