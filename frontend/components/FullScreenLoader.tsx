// src/components/FullScreenLoader.tsx
import { useLoading } from "../src/context/LoadingContext";
import { Loader2 } from "lucide-react";

export default function FullScreenLoader() {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Loader2 className="animate-spin w-16 h-16 text-white" />
    </div>
  );
}
