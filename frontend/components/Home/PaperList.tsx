import { type Paper } from '../../lib/types';
import PaperCard from './PaperCard';

type PaperListProps = {
  papers: Paper[];
};

export default function PaperList({ papers }: PaperListProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4">
        {papers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>
    </div>
  );
}
