import { useState } from "react";

type SettingsData = {
  theme: string;
  notifications: boolean;
  language: string;
};

type SettingsTabProps = {
  onChange?: (data: SettingsData) => void;
};

export default function SettingsTab({ onChange }: SettingsTabProps) {
  const [formData, setFormData] = useState<SettingsData>({
    theme: "dark",
    notifications: true,
    language: "english",
  });

  const handleChange = (key: keyof SettingsData, value: any) => {
    const updatedData = { ...formData, [key]: value };
    setFormData(updatedData);
    onChange?.(updatedData);
  };

  return (
    <div className="space-y-6">

      {/* Theme Selection */}
      <div>
        <label className="text-sm">Theme</label>
        <select
          className="w-full mt-2 p-3 bg-neutral-800 border border-white/10 rounded-lg"
          value={formData.theme}
          onChange={(e) => handleChange("theme", e.target.value)}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="system">System Default</option>
        </select>
      </div>

      {/* Notifications Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm">Enable Notifications</label>
        <input
          type="checkbox"
          checked={formData.notifications}
          onChange={(e) => handleChange("notifications", e.target.checked)}
          className="w-5 h-5 cursor-pointer accent-[var(--color-orange)]"
        />
      </div>

      {/* Language */}
      <div>
        <label className="text-sm">Language</label>
        <select
          className="w-full mt-2 p-3 bg-neutral-800 border border-white/10 rounded-lg"
          value={formData.language}
          onChange={(e) => handleChange("language", e.target.value)}
        >
          <option value="english">English</option>
          <option value="hindi">Hindi</option>
          <option value="spanish">Spanish</option>
        </select>
      </div>
    </div>
  );
}
