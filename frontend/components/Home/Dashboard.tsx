import React, { useState } from "react";
import { PlusCircle, XIcon } from "lucide-react";
import { type Paper } from "../../lib/types";

import DashBoardMain from "./DashBoardMain";
import KeywordPromptInput from "./KeywordPromptInput";
import TextType from "./TextType";

export const samplePapers: Paper[] = [
  // ...same papers unchanged
];

export default function Dashboard(): JSX.Element {
  const [newSearch, setNewSearch] = useState(false);

  const HeaderSection = () => (
    <header className="mb-8 w-full">
      {!newSearch ? (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--color-orange)] tracking-tight font-bungee">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-2 max-w-xl leading-relaxed">
              Welcome back — here’s your ScholarMind overview. Insights, activity
              and quick actions to help your research flow.
            </p>
          </div>
          <button
            onClick={() => setNewSearch(true)}
            className="flex items-center gap-2 bg-[var(--color-orange)] border border-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:scale-[1.03] active:scale-95 transition"
          >
            <PlusCircle size={18} />
            <span className="text-sm font-bungee">New Research</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white/5 p-4 rounded-xl w-full border border-white/10">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--color-orange)] tracking-tight font-bungee">
              New Search
            </h1>
            <p className="text-gray-400 mt-2 max-w-xl leading-relaxed">
              Search for new research topics and ideas.
            </p>
          </div>
          <button
            onClick={() => setNewSearch(false)}
            className="flex items-center gap-2 bg-[var(--color-light)] text-[var(--color-gray)] border border-white/10 px-4 py-2 rounded-lg hover:scale-[1.03] active:scale-95 transition"
          >
            <XIcon size={18} />
            <span className="text-sm font-bungee">Close</span>
          </button>
        </div>
      )}
    </header>
  );

  const NewSearchSection = () => (
    <div className="flex flex-col items-center justify-end w-full mt-2 max-w-4xl mx-auto min-h-[50vh]">
      <div className="mb-10 py-2 text-center">
        <TextType
          text={[
            "Let's find research that matters...",
            "Be specific — define your topic clearly...",
            "Mention domain, problem & goal...",
            "Add context like datasets, time range, or authors...",
            "Build a meaningful research query!"
          ]}
          typingSpeed={85}
          pauseDuration={1600}
          showCursor={true}
          cursorCharacter="|"
        />
      </div>
      <KeywordPromptInput />
    </div>
  );

  return (
    <main className="flex-1 min-h-screen w-full text-[var(--color-light)] bg-[var(--color-gray)] overflow-y-auto">
      <div className="max-w-screen mx-auto px-6 py-10 flex flex-col">
        <HeaderSection />
        {!newSearch ? <DashBoardMain /> : <NewSearchSection />}
      </div>
    </main>
  );
}
