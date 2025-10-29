type ModalFooterProps = {
  onSave: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function ModalFooter({ onSave, onCancel, loading }: ModalFooterProps) {
  return (
    <div className="flex justify-end gap-4 mt-8 border-t border-white/10 pt-6">
      <button
        onClick={onCancel}
        className="px-6 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition"
      >
        Cancel
      </button>

      <button
        onClick={onSave}
        disabled={loading}
        className="px-6 py-2 rounded-lg bg-[var(--color-orange)] text-black font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
