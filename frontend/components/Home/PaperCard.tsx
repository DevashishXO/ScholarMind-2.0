import { Lock, Folder, Calendar, Plus } from "lucide-react";
import { type Paper } from "../../lib/types";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

type PaperCardProps = {
  paper: Paper;
  isMyCollection?: boolean;
  isSynthesizeOpen?: boolean;
  isSelected?: boolean;
};

export default function PaperCard({
  paper,
  isMyCollection = false,
  isSynthesizeOpen = false,
  isSelected = false,
}: PaperCardProps) {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);

  const [newCollectionName, setNewCollectionName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCardClick = () => {
    if (!isSynthesizeOpen){
      sessionStorage.setItem('currentPaper', JSON.stringify(paper));
      navigate(`/smart-search/${paper.paper_id}`, { state: { paper } });
    }
  };

  // ----------------------------------------------------
  // FETCH USER COLLECTIONS
  // ----------------------------------------------------
  const fetchCollections = async () => {
    try {
      setLoadingCollections(true);
      const res = await fetch("http://localhost:8000/api/v1/my-collection/", {
        credentials: "include",
      });
      const data = await res.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error("Failed to fetch collections:", error);
    } finally {
      setLoadingCollections(false);
    }
  };

  const handleSaveClick = (e: any) => {
    e.stopPropagation();
    fetchCollections();
    setShowModal(true);
  };

  // ----------------------------------------------------
  // ADD PAPER INTO EXISTING COLLECTION → CLOSE MODAL
  // ----------------------------------------------------
  const addToCollection = async (collectionId: string) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/my-collection/${collectionId}/papers`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paper_id: paper.id,
            title: paper.title,
            authors: paper.authors,
            abstract: paper.abstract,
            // type: paper.type,
            // noOfCitations: paper.noOfCitations,
            year: paper.year,
            // keywords: paper.keywords,
            // access: paper.access,
            doi: paper.doi,
            url: paper.url,
            pdfUrl: paper.pdfUrl,
            primary_category: paper.primary_category,
            categories: paper.categories
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        alert(data.detail || "Failed to save paper.");
        return;
      }

      // ALWAYS close modal on success
      setShowModal(false);
      setNewCollectionName("");
      
    } catch (err) {
      console.error("Error adding paper:", err);
    }
  };

  // ----------------------------------------------------
  // CREATE NEW COLLECTION + ADD PAPER
  // ----------------------------------------------------
  const createAndAdd = async () => {
    if (!newCollectionName.trim()) {
      alert("Enter collection name");
      return;
    }

    try {
      setCreating(true);

      // CREATE COLLECTION
      const res = await fetch("http://localhost:8000/api/v1/my-collection/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection_name: newCollectionName }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || "Failed to create collection");
        setCreating(false);
        return;
      }

      const newId = data.collection._id;

      // ADD PAPER inside new collection
      await addToCollection(newId);

      // Close modal directly to avoid duplicate closings
      setShowModal(false);
      setNewCollectionName("");

      setCreating(false);
    } catch (err) {
      console.error("Create collection error:", err);
      setCreating(false);
    }
  };

  // ----------------------------------------------------
  // REMOVE PAPER (if inside a collection page)
  // ----------------------------------------------------
  const handleRemove = async (e: any) => {
    e.stopPropagation();

    const currentUrl = window.location.pathname;
    const collectionId = currentUrl.split("/").pop();

    if (!collectionId) {
      alert("Invalid collection");
      return;
    }

    if (!confirm("Remove this paper?")) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/my-collection/${collectionId}/papers/${paper.id}`,  // FIXED
        { method: "DELETE", credentials: "include" }
      );

      if (!res.ok) {
        const data = await res.json();
        alert(data.detail || "Failed to remove paper");
        return;
      }

      window.location.reload();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <>
      {/* CARD UI (unchanged) */}
      <div
        onClick={handleCardClick}
        className={`group border border-neutral-700/60 transition-all w-full duration-300 rounded-2xl p-6 shadow-lg hover:shadow-[var(--color-orange)] ${
          isSelected
            ? "bg-neutral-900/80 hover:ring-1 hover:scale-101"
            : "bg-neutral-900/50"
        }`}
      >
        <h2 className="text-xl font-semibold text-[var(--color-light)] group-hover:text-[var(--color-orange)] transition line-clamp-2 mb-2">
          {paper.title || 'Refer to the docs'}
        </h2>

        <p className="text-sm text-neutral-400 mb-3 italic">
          {paper.authors.join(", ") || 'Refer to the docs'}
        </p>

        <p className="text-sm text-neutral-300 mb-4 leading-relaxed line-clamp-3">
          {paper.abstract || 'Refer to the docs'}
        </p>

        {!isSynthesizeOpen && (
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-500">
              <span>📅 {paper.year}</span> •{" 📚 Category:"}
              <span className="text-white/70"> <span className="text-[var(--color-orange)]">{paper.primary_category || 'Refer to the docs'}</span>  {paper.categories.map((category) => ` ${category.label && category.label !== paper.primary_category ? category.label : ''}`).join(", ")}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/smart-search/${paper.paper_id}`, { state: { paper } });
                }}
                className="text-sm px-4 py-2 font-bungee rounded-lg bg-[var(--color-orange)] text-[var(--color-light)] hover:bg-orange-500/70 transition shadow-md cursor-pointer"
              >
                View →
              </button>

              {isMyCollection ? (
                <button
                  onClick={handleRemove}
                  className="text-sm px-4 py-2 font-bungee rounded-lg bg-[var(--color-light)] text-[var(--color-gray)] hover:bg-neutral-300 transition shadow-md cursor-pointer"
                >
                  Remove →
                </button>
              ) : (
                <button
                  onClick={handleSaveClick}
                  className="text-sm px-4 py-2 rounded-lg font-bungee bg-[var(--color-light)] text-[var(--color-gray)] hover:bg-[var(--color-orange)] hover:text-neutral-900 transition cursor-pointer"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* SAVE MODAL + CREATE COLLECTION SECTION               */}
      {/* ---------------------------------------------------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-neutral-900/90 border border-neutral-700/70 shadow-2xl rounded-2xl w-[90%] max-w-lg p-6 animate-slideUp">

            <h2 className="text-2xl font-bungee text-[var(--color-orange)] mb-4">
              Save to Collection
            </h2>

            {/* CREATE NEW COLLECTION */}
            <div className="mb-6 p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
              <p className="text-neutral-300 text-sm mb-2">Create a new collection:</p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="New collection name"
                  className="flex-1 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 
                             text-neutral-200 focus:border-[var(--color-orange)] outline-none transition"
                />

                <button
                  onClick={createAndAdd}
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-[var(--color-orange)] text-black font-bungee 
                               hover:bg-orange-500/80 transition disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* LIST EXISTING COLLECTIONS */}
            {loadingCollections ? (
              <p className="text-neutral-300 text-center py-6">Loading...</p>
            ) : (
              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1 custom-scroll">
                {collections.length === 0 ? (
                  <p className="text-neutral-400 text-center py-4">
                    No collections found.
                  </p>
                ) : (
                  collections.map((col) => (
                    <button
                      key={col._id}
                      onClick={() => addToCollection(col._id)}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700/70 
                                 text-left text-neutral-200 hover:bg-neutral-800/80 hover:border-[var(--color-orange)] 
                                 hover:shadow-[0_0_12px_var(--color-orange)] transition"
                    >
                      <div className="flex items-center gap-3">
                        <Folder className="w-5 h-5 text-[var(--color-orange)]" />
                        <span>{col.collection_name}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* CANCEL */}
            <div className="flex justify-end mt-6">
              <button
                className="px-5 py-2 rounded-lg bg-neutral-800 border border-neutral-700/70 
                           text-neutral-300 hover:bg-neutral-700 transition font-bungee"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
