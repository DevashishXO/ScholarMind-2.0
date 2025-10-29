import { useState } from "react";

type ProfileData = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
  twitter: string;
  github: string;
  avatar?: string;
};

type ProfileTabProps = {
  onChange?: (data: ProfileData) => void;
};

export default function ProfileTab({ onChange }: ProfileTabProps) {
  const [formData, setFormData] = useState<ProfileData>({
    fullName: "",
    username: "",
    email: "user@example.com",
    phone: "",
    bio: "",
    location: "",
    website: "",
    twitter: "",
    github: "",
    avatar: "",
  });

  const handleChange = (field: keyof ProfileData, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange?.(updated);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("⚠️ File size too large. Max 2MB allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => handleChange("avatar", reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center gap-6">
        <img
          src={formData.avatar || "https://via.placeholder.com/100"}
          alt="Profile"
          className="w-20 h-20 rounded-full border border-white/20 object-cover shadow-sm"
        />
        <div>
          <label
            htmlFor="avatar"
            className="cursor-pointer px-4 py-2 bg-white/10 rounded-md hover:bg-white/20 transition border border-white/10"
          >
            Upload Photo
          </label>
          <input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          <p className="text-xs text-neutral-400 mt-1">Max size: 2MB</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 gap-6">
        <Input label="Full Name" placeholder="John Doe" value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} />
        <Input label="Username" placeholder="username123" value={formData.username} onChange={(e) => handleChange("username", e.target.value)} />
        <Input label="Email" value={formData.email} readOnly />
        <Input label="Phone" placeholder="+91 9876543210" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
        <Input label="Location" placeholder="Mumbai, India" value={formData.location} onChange={(e) => handleChange("location", e.target.value)} />
        <Input label="Website" placeholder="https://example.com" value={formData.website} onChange={(e) => handleChange("website", e.target.value)} />
        <Input label="Twitter" placeholder="@username" value={formData.twitter} onChange={(e) => handleChange("twitter", e.target.value)} />
        <Input label="GitHub" placeholder="github-username" value={formData.github} onChange={(e) => handleChange("github", e.target.value)} />
      </div>

      <div>
        <label className="text-sm font-medium">Bio</label>
        <textarea
          className="w-full mt-2 p-3 bg-neutral-800 border border-white/10 rounded-lg resize-none focus:border-[var(--color-orange)] outline-none transition"
          rows={4}
          placeholder="Write something about yourself..."
          value={formData.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
        ></textarea>
      </div>
    </div>
  );
}

type InputProps = {
  label: string;
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

function Input({ label, value, placeholder, readOnly, onChange }: InputProps) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium">{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={onChange}
        className={`w-full mt-2 p-3 bg-neutral-800 border border-white/10 rounded-lg outline-none transition ${
          readOnly ? "opacity-50 cursor-not-allowed" : "focus:border-[var(--color-orange)]"
        }`}
      />
    </div>
  );
}
