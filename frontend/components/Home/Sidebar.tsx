import { useState } from "react";

const tabs = [
  { name: "Dashboard", logoSrc: "/icons8-dashboard-48.png", alt: "Dashboard Logo" },
  { name: "Smart Search", logoSrc: "/icons8-research-50.png", alt: "Smart Search Logo" },
  { name: "My Collections", logoSrc: "/icons8-collectibles-50.png", alt: "My Collections Logo" },
  { name: "Settings", logoSrc: "/icons8-setting-50.png", alt: "Settings Logo" },
];

const recentChats = [
  { name: "Alice", message: "How do I start a project?" },
  { name: "Bob", message: "Can you help me with AI search?" },
  { name: "Charlie", message: "New updates on ScholarMind" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static top-0 left-0 z-50 h-screen w-64 md:w-[20%] bg-neutral-900 border-r border-gray-700 flex flex-col justify-between p-6 text-[var(--color-light)] transition-transform duration-300`}
      >
        {/* Top Section */}
        <div>
          <div className="flex justify-between items-center mb-8">
            {/* Menu Toggle (mobile only) */}
            <button
              className="text-[var(--color-light)] hover:text-[var(--color-orange)] transition-all duration-300 md:hidden"
              onClick={() => setIsOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Logo */}
            <h1 className="text-2xl font-bold bungee-regular text-[var(--color-orange)]">ScholarMind</h1>
          </div>

          {/* Tabs */}
          <ul className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <li
                key={tab.name}
                className="
                  flex items-center gap-3 p-3 text-lg font-semibold rounded-xl
                  text-[var(--color-light)]
                  hover:bg-[var(--color-light)]
                  hover:text-[var(--color-gray)]
                  cursor-pointer
                  transition-all duration-300
                  shadow-sm
                "
              >
                <img src={tab.logoSrc} alt={tab.alt} className="h-6 w-6" />
                {tab.name}
              </li>
            ))}
          </ul>

          {/* Research Bot button */}
          <div className="flex items-center gap-2 p-3 mt-4 rounded-2xl bg-white text-[var(--color-gray)] font-bungee hover:shadow-lg hover:bg-[var(--color-orange)] transition cursor-pointer">
            <img src="/icons8-bot-64.png" alt="Bot Logo" className="h-10 w-10" />
            <h1>Research-Bot</h1>
          </div>

          {/* Recent Chats */}
          <div className="mt-6 p-3 overflow-y-auto max-h-64 md:max-h-none">
            <h2 className="text-[var(--color-orange)] text-xl font-semibold mb-2">Recent Chats</h2>
            <ul className="flex flex-col gap-2">
              {recentChats.map((chat) => (
                <li
                  key={chat.name}
                  className="flex flex-col bg-neutral-800 p-2 rounded-lg hover:bg-[var(--color-light)] hover:text-[var(--color-gray)] cursor-pointer transition shadow-sm"
                >
                  <span className="font-semibold">{chat.name}</span>
                  <span className="text-sm text-gray-300">{chat.message}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer: Profile + Settings */}
        <div className="mt-6 flex items-center justify-between p-3 bg-neutral-800 rounded-xl shadow-inner">
          <div className="flex items-center gap-2">
            <img src="/icons8-profile-picture-50.png" alt="User" className="h-10 w-10 rounded-full" />
            <span className="font-medium hidden md:inline">Updating Me</span>
          </div>
          <button className="p-2 hover:text-[var(--color-orange)] transition">
            <img src="/icons8-setting-50.png" alt="Settings" className="h-6 w-6" />
          </button>
        </div>
      </aside>

      {/* Mobile Navbar Toggle Button */}
      <button
        className="fixed bottom-6 right-6 md:hidden bg-[var(--color-orange)] text-white p-3 rounded-full shadow-lg hover:scale-105 transition-transform"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full md:hidden bg-neutral-900 border-t border-gray-700 flex justify-around items-center p-2">
        {tabs.map((tab) => (
          <div key={tab.name} className="flex flex-col items-center text-xs text-[var(--color-light)]">
            <img src={tab.logoSrc} alt={tab.alt} className="h-6 w-6 mb-1" />
            {tab.name}
          </div>
        ))}
      </div>
    </>
  );
}
