type ModalHeaderProps = {
  title: string;
  onClose: () => void;
};

export default function ModalHeader({ title, onClose }: ModalHeaderProps) {
  const getTitle = () => {
    if (title === "profile") return "Edit Profile";
    if (title === "account") return "Account Settings";
    if (title === "settings") return "Preferences";
    return "";
  };

  return (
    <header className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold capitalize">{getTitle()}</h2>
      <button
        onClick={onClose}
        className="text-sm px-4 py-2 border border-white/20 rounded-lg hover:bg-white hover:text-neutral-800 transition cursor-pointer font-bungee"
      >
        Close
      </button>
    </header>
  );
}
