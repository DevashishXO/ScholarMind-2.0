import { type Paper } from "../../lib/types";
import PaperCard from "./PaperCard";

type PaperListProps = {
  papers: Paper[];
  isMyCollection?: boolean;
  isSynthesizeOpen?: boolean;
  setIsSynthesizeOpen?: (isOpen: boolean) => void;
  selectedPapers?: string[];
  setSelectedPapers?: (papers: string[]) => void;
};

export default function PaperList({
  papers,
  isMyCollection = false,
  isSynthesizeOpen = false,
  setIsSynthesizeOpen,
  selectedPapers,
  setSelectedPapers,
}: PaperListProps) {
  const togglePaperSelection = (paperId: string) => {
    if (!setSelectedPapers || !selectedPapers) return;

    setSelectedPapers(
      selectedPapers.includes(paperId)
        ? selectedPapers.filter((id) => id !== paperId)
        : [...selectedPapers, paperId]
    );
  };

  return (
    <div className="w-full relative">

      {/* Paper cards */}
      <div className="grid grid-cols-1 gap-4">
        {papers.map((paper) => (
          <div className="flex items-start gap-4" key={paper.id}>
            {isSynthesizeOpen && (
              <input
                type="checkbox"
                checked={selectedPapers?.includes(paper.id) ?? false}
                onChange={() => togglePaperSelection(paper.id)}
                className="mt-6 w-5 h-5 cursor-pointer"
              />
            )}
            <PaperCard
              paper={paper}
              isMyCollection={isMyCollection}
              isSynthesizeOpen={isSynthesizeOpen}
              isSelected={selectedPapers?.includes(paper.id) ?? false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
