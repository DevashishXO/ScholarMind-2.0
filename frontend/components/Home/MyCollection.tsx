import { useEffect, useState } from "react";
import CollectionCard from "./CollectionCard";
import SearchBar from "./SearchBar";

type Collection = {
  _id: string;
  collection_name: string;
  description?: string;
  saved_papers: any[];
  created_at: string;
};

export default function MyCollection() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [collectionName, setCollectionName] = useState("");

  // Fetch Collections
  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/v1/my-collection/", {
        credentials: "include",
      });

      const data = await res.json();
      setCollections(data.collections || []);
    } catch (err) {
      console.error("Failed to fetch collections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // Create Collection
  const createCollection = async () => {
    if (!collectionName.trim()) return;

    try {
      const res = await fetch("http://localhost:8000/api/v1/my-collection/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection_name: collectionName }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Failed to create collection");
        return;
      }

      setShowModal(false);
      setCollectionName("");
      fetchCollections();
    } catch (err) {
      console.error("Create collection error:", err);
    }
  };

  return (
    <>
      <main className="flex-1 p-8 text-[var(--color-light)] max-h-screen flex flex-col">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-shrink-0">
          <h1 className="text-3xl md:text-4xl font-bungee font-bold text-[var(--color-orange)]">
            My-Collection
          </h1>

          <button
            className="px-6 py-2 rounded-lg bg-[var(--color-orange)] hover:bg-[var(--color-light)] hover:text-[var(--color-gray)] transition font-bungee cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            + Create
          </button>
        </div>

        {/* Search Bar */}
        <SearchBar />

        {/* Content */}
        {loading ? (
          <p className="mt-6 text-lg">Loading...</p>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-10 text-center animate-fadeIn">
        
            {/* Icon */}
            <div className="p-6 bg-neutral-800/50 border border-neutral-700/50 rounded-2xl shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-[var(--color-orange)] opacity-80"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
        
            {/* Title */}
            <h2 className="text-2xl font-bungee text-[var(--color-light)] mt-6">
              No Collections Yet
            </h2>
        
            {/* Subtitle */}
            <p className="text-neutral-400 max-w-md mt-2">
              Organize your research by creating collections. Save papers, group topics,
              and build your personal research library.
            </p>
        
            {/* CTA Button */}
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 px-6 py-3 rounded-lg bg-[var(--color-orange)] 
                         text-[var(--color-light)] font-bungee 
                         hover:scale-[1.02] transition shadow-lg"
            >
              + Create Your First Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mt-4 animate-fadeIn">
            {collections.map((collection) => (
              <CollectionCard
                key={collection._id}
                collectionId={collection._id}
                title={collection.collection_name}
                description={collection.description || "No description"}
                noOfItems={collection.saved_papers?.length || 0}
                createdAt={new Date(collection.created_at)}
                onDelete={fetchCollections}
              />
            ))}
          </div>
        )}
      </main>

      {/* CREATE COLLECTION MODAL       */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-700/60 p-6 rounded-xl w-[90%] max-w-md shadow-lg">
            <h2 className="text-xl font-bungee mb-4 text-[var(--color-orange)]">
              Create New Collection
            </h2>

            {/* INPUT */}
            <input
              className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-[var(--color-light)] outline-none focus:border-[var(--color-orange)] transition"
              placeholder="Enter collection name..."
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
            />

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition font-bungee"
                onClick={() => {
                  setShowModal(false);
                  setCollectionName("");
                }}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-[var(--color-orange)] text-[var(--color-light)] rounded-lg hover:scale-[1.02] transition font-bungee"
                onClick={createCollection}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}