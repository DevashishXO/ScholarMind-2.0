import { Folder, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

type CollectionCardProps = {
  title: string;
  description: string;
  noOfItems: number;
  createdAt: Date;
};

export default function CollectionCard({
  title,
  description,
  noOfItems,
  createdAt,
}: CollectionCardProps) {
  
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col bg-neutral-900/50 backdrop-blur-md border border-neutral-700/50 
      rounded-xl p-5 text-[var(--color-light)] shadow-md 
      transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      onClick={() => navigate(`/my-collection/${title}`)}
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b border-neutral-700/40 pb-3">
        {/* Left */}
        <div className="flex gap-3 items-start">
          <div className="p-2 bg-neutral-800/60 rounded-lg border border-neutral-700/40">
            <Folder className="w-6 h-6 text-[var(--color-orange)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold hover:text-[var(--color-orange)] transition">
              {title}
            </h2>
            <p className="text-sm text-gray-400 line-clamp-2">{description}</p>
          </div>
        </div>

        {/* Menu */}
        <button className="hover:bg-neutral-800/60 p-2 rounded-lg transition border border-transparent hover:border-neutral-700/50">
          <MoreVertical className="w-5 h-5 text-gray-300 hover:text-[var(--color-orange)] transition" />
        </button>
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
