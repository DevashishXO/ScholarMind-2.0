import { Edit, Folder, MoreVertical, Delete } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

type CollectionCardProps = {
  collectionId: string;
  title: string;
  description: string;
  noOfItems: number;
  createdAt: Date;
  onDelete: () => void;
};

export default function CollectionCard({
  collectionId,
  title,
  description,
  noOfItems,
  createdAt,
  onDelete
}: CollectionCardProps) {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------------------------
  // DELETE COLLECTION API CALL
  // ---------------------------
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this collection?")) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/my-collection/${collectionId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Failed to delete collection");
        return;
      }

      onDelete();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div
      className="flex flex-col bg-neutral-900/50 backdrop-blur-md border border-neutral-700/50 rounded-xl p-5 text-[var(--color-light)] shadow-md transition-all duration-300 hover:-translate-y-1 relative"
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b border-neutral-700/40 pb-3">

        {/* Left side → Navigate */}
        <div
          className="flex gap-3 items-start cursor-pointer"
          onClick={() => navigate(`/my-collection/${collectionId}`)}
        >
          <div className="p-2 bg-neutral-800/60 rounded-lg border border-neutral-700/40">
            <Folder className="w-6 h-6 text-[var(--color-orange)]" />
          </div>

          <div>
            <h2 className="text-lg font-semibold hover:text-[var(--color-orange)] transition">
              {title}
            </h2>
            <p className="text-sm text-gray-400 line-clamp-2">
              {description}
            </p>
          </div>
        </div>

        {/* Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="hover:bg-neutral-800/60 p-2 rounded-lg transition border border-transparent hover:border-neutral-700/50"
          >
            <MoreVertical className="w-5 h-5 text-gray-300 hover:text-[var(--color-orange)] transition" />
          </button>

          {/* Dropdown Menu */}
          {openMenu && (
            <div className="absolute right-0 w-36 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg z-50">
              <button
                className="w-full flex gap-2 items-center px-4 py-2 text-left hover:bg-neutral-800 transition"
                onClick={() => alert("Edit coming soon…")}
              >
                <Edit/>
                Edit
              </button>

              <button
                className="w-full flex gap-2 items-center px-4 py-2 text-left text-red-400 hover:bg-neutral-800 transition"
                onClick={handleDelete}
              >
                <Delete/>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-4 items-center">
        <div className="rounded-xl bg-neutral-800/60 px-4 py-1 text-sm border border-neutral-700/40">
          {noOfItems} Papers
        </div>
        <div className="text-sm text-gray-400">
          {createdAt.toISOString().split("T")[0]}
        </div>
      </div>
    </div>
  );
}
