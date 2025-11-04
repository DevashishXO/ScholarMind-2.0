import { useNavigate, useRouteLoaderData } from "react-router-dom";
import { UserCircle, LucideMenu, LogOut } from "lucide-react";
import { useLogout } from "../../src/services/auth";
import toast, { ToastBar } from "react-hot-toast";

type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  tabSelected: string;
  setTabSelected: (tabSelected: string) => void;
  tabs: { name: string; logoSrc: string; alt: string }[];
  profileIsOpen: boolean;
  setProfileIsOpen: (profileIsOpen: boolean) => void;
};

const recentChats = [
  { name: "Alice", message: "How do I start a project?" },
  { name: "Bob", message: "Can you help me with AI search?" },
  { name: "Charlie", message: "New updates on ScholarMind" },
];

export default function Sidebar({ isOpen = false, setIsOpen, tabSelected, setTabSelected, tabs , profileIsOpen, setProfileIsOpen }: SidebarProps) {
  const navigate = useNavigate();
  const checkLogoutMutation = useLogout();

  const handleTabClick = (tabName: string) => {
    setTabSelected(tabName);
    switch (tabName) {
      case "Dashboard":
        navigate("/");
        break;
      case "Smart Search":
        navigate("/smart-search");
        break;
      case "My Collections":
        navigate("/my-collection");
        break;
      case "Research Bot":
        navigate("/research-bot");
        break;
      case "My Profile":
        navigate("/my-profile");
        break;
      default:
        navigate("/");
    }
    setIsOpen(false);
  };
  
  const handleLogout = () => {
    checkLogoutMutation.mutate();
    setTimeout(() => {
      toast.success("Logged out successfully!");
      navigate("/landing");
      setIsOpen(false);
    }, 1000);
  };
  
  return (
    <>
      <aside
        className={`
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 fixed md:static top-0 left-0 z-50 h-screen w-64 md:w-[20%]
          bg-neutral-900 border-r border-gray-700 flex flex-col justify-between p-6
          text-[var(--color-light)] transition-transform duration-500 ease-in-out
          shadow-lg
        `}
      >
        {/* Top Section */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <button
              className="text-[var(--color-light)] hover:text-[var(--color-orange)] transition-all duration-300 md:hidden"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
            <h1 className="text-2xl font-bold bungee-regular text-[var(--color-orange)]">ScholarMind</h1>
          </div>

          {/* Tabs */}
          <ul className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <li
                key={tab.name}
                onClick={() => handleTabClick(tab.name)}
                className={`
                  flex items-center gap-3 px-3 py-2 text-md font-semibold rounded-xl cursor-pointer
                  transition-all duration-300 shadow-sm
                  ${tabSelected === tab.name
                    ? "bg-[var(--color-light)] text-[var(--color-gray)] scale-[1.02]"
                    : "hover:bg-neutral-800 hover:scale-[1.01]"
                  }
                `}
              >
                <img src={tab.logoSrc} alt={tab.alt} className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                <span>{tab.name}</span>
              </li>
            ))}
          </ul>

          {/* Research Bot */}
          <div className={`${tabSelected === "Research Bot" ? "bg-[var(--color-light)] text-[var(--color-gray)] scale-[1.02]" : "bg-[var(--color-orange)] text-[var(--color-light)] hover:scale-[1.01]"} flex items-center gap-2 px-3 py-2 mt-4 rounded-xl 
            hover:bg-[var(--color-light)] hover:text-[var(--color-gray)]
            transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg font-bungee`}
              onClick={()=> handleTabClick("Research Bot")}
            >
            <img src="/icons8-bot-64.png" alt="Bot Logo" className="h-10 w-10" />
            <h1>Research-Bot</h1>
          </div>

          {/* Recent Chats */}
          <div className="mt-6 py-4 px-2 overflow-y-auto max-h-64 border-t border-neutral-700">
            <h2 className="text-[var(--color-orange)] text-lg font-semibold mb-2">Recent Chats</h2>
            <ul className="flex flex-col gap-2">
              {recentChats.map((chat) => (
                <li
                  key={chat.name}
                  className="bg-[var(--color-gray)] text-white p-2 rounded-lg hover:bg-neutral-800
                  transition-all duration-300 shadow-sm cursor-pointer"
                >
                  {chat.message}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between p-3 bg-neutral-800 rounded-xl shadow-inner">
          <div className="flex items-center gap-2">
            <UserCircle size={28} className="hover:text-[var(--color-orange)] cursor-pointer" />
          </div>
          <div className="flex items-center gap-2">
            <LucideMenu size={24} className="hover:text-[var(--color-orange)] cursor-pointer"
            onClick={() => {
              setProfileIsOpen(!profileIsOpen);
            }} />
            <LogOut size={24} className="hover:text-[var(--color-orange)] cursor-pointer "
              onClick={handleLogout} />
          </div>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <button
        className="fixed bottom-6 right-6 md:hidden bg-[var(--color-orange)] text-white p-3 rounded-full
        shadow-lg hover:scale-110 transition-transform duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>
    </>
  );
}
