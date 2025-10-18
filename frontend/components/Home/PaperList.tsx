import { type Paper } from '../../lib/types';
import PaperCard from './PaperCard';

type PaperListProps = {
  papers: Paper[];
};

export default function PaperList({ papers }: PaperListProps) {
  return (
    <div className="w-full py-4 mb-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Search Results:</h2>
      <div className="grid grid-cols-1">
        {papers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>
    </div>
  );
}