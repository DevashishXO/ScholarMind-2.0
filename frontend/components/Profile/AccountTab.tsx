import { useState } from "react";

type AccountData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type AccountTabProps = {
  onChange?: (data: AccountData) => void;
};

export default function AccountTab({ onChange }: AccountTabProps) {
  const [formData, setFormData] = useState<AccountData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (key: keyof AccountData, value: string) => {
    const updatedData = { ...formData, [key]: value };
    setFormData(updatedData);
    onChange?.(updatedData);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400 mb-2">
        Update your password below. Your password must be at least 6 characters long.
      </p>

      <Input
        label="Current Password"
        type="password"
        value={formData.currentPassword}
        onChange={(e) => handleChange("currentPassword", e.target.value)}
      />

      <Input
        label="New Password"
        type="password"
        value={formData.newPassword}
        onChange={(e) => handleChange("newPassword", e.target.value)}
      />

      <Input
        label="Confirm New Password"
        type="password"
        value={formData.confirmPassword}
        onChange={(e) => handleChange("confirmPassword", e.target.value)}
      />
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input
        {...props}
        className="w-full mt-2 p-3 bg-neutral-800 border border-white/10 rounded-lg outline-none focus:border-[var(--color-orange)] transition"
      />
    </div>
  );
}
