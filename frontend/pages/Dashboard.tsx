import Mainbody from '../components/Dashboard/Mainbody';
import Sidebar from '../components/Dashboard/Sidebar';

export default function Dashboard() {  
  return (
    <div className="flex min-h-screen w-full text-[var(--color-light)]">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Body */}
      <Mainbody />
    </div>
  );
}
