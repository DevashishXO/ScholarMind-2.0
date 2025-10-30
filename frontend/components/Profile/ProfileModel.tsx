import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import ModalHeader from "./ModalHeader";
import ProfileTab from "./ProfileTab";
import AccountTab from "./AccountTab";
import SettingsTab from "./SettingsTab";

type ProfileModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialTab?: "profile" | "account" | "settings";
};

export default function ProfileModal({ isOpen, setIsOpen, initialTab = "profile" }: ProfileModalProps) {
  const [active, setActive] = useState(initialTab);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const onClose = () => setIsOpen(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setActive(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="relative w-full max-w-4xl h-[75%] bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl flex overflow-hidden animate-modal-in">

        <Sidebar active={active} setActive={setActive} />

        <main className="flex-1 p-6 overflow-y-auto max-h-[85vh]">
          <ModalHeader onClose={onClose} title={active} />

          {active === "profile" && <ProfileTab />}
          {active === "account" && <AccountTab />}
          {active === "settings" && <SettingsTab />}
        </main>
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-in { animation: modal-in .25s ease-out forwards; }
      `}</style>
    </div>
  );
}
