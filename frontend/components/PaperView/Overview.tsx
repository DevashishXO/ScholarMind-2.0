// /components/paper-view/Overview.tsx
type OverviewProps = {
  abstract: string;
  keywords: string[];
};

export default function Overview({ abstract, keywords }: OverviewProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl text-left text-[var(--color-light)]">
      <h2 className="text-3xl font-semibold mb-4">Overview</h2>
      <p className="mb-4 text-xl ">{abstract}</p>
      {/*<div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className="px-3 py-1 bg-[var(--color-orange)] rounded-full text-md font-medium"
          >
            {keyword}
          </span>
        ))}
      </div>*/}
    </div>
  );
}
