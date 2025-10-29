import { User, Shield, Settings } from "lucide-react";

type SidebarProps = {
  active: string;
  setActive: (tab: "profile" | "account" | "settings") => void;
};

export default function Sidebar({ active, setActive }: SidebarProps) {
  const tabs = [
    { name: "profile", label: "Profile", icon: <User size={18} /> },
    { name: "account", label: "Account", icon: <Shield size={18} /> },
    { name: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 bg-neutral-800 p-6 border-r border-white/10">
      <h3 className="text-lg font-semibold mb-6">Menu</h3>
      <nav className="space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActive(tab.name as any)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full transition cursor-pointer text-white ${
              active === tab.name
                ? "bg-[var(--color-orange)] text-black font-medium shadow-md"
                : "hover:bg-white/10 text-white"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
