import React from "react";

export default function MyProfile() {
  const profile = {
    name: "Dr. Alex Thompson",
    institution: "Stanford University",
    email: "alex.thompson@stanford.edu",
    interests: ["AI", "Machine Learning", "Robotics"],
    papers: [
      {
        title: "Deep Reinforcement Learning for Robotics",
        authors: "Alex Thompson, Jamie Li, Priya Mehta",
        journal: "IEEE Transactions on Robotics",
        year: 2022,
        citedBy: 45,
      },
      {
        title: "Neural Networks for Edge Devices",
        authors: "Alex Thompson, Sarah Kim",
        journal: "CVPR",
        year: 2021,
        citedBy: 38,
      },
      {
        title: "Transfer Learning in Medical Imaging",
        authors: "Alex Thompson, Robert Lee",
        journal: "Nature Machine Intelligence",
        year: 2020,
        citedBy: 52,
      },
    ],
  };

  return (
    <div className="min-h-screen text-[var(--color-light)] p-4 flex-1 flex flex-col md:flex-row gap-3">
      {/* Left Section */}
      <div className="flex-1 backdrop-blur-lg bg-neutral-800 border border-neutral-700 rounded-lg p-6 shadow-2xl">
        <div className="flex items-center gap-6 border-b border-white/20 pb-6">
          <div className="w-24 h-24 rounded-full bg-[var(--color-orange)] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-14 w-14 text-[var(--color-light)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75H4.5v-.75z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-gray-400 flex items-center gap-2">
              <span>🏛️</span> {profile.institution}
            </p>
            <p className="text-gray-400 flex items-center gap-2">
              <span>📧</span> {profile.email}
            </p>
            <p className="text-sm text-[var(--color-orange)] mt-2">
              {profile.interests.join(", ")}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-gray-400 border-b border-white/10 pb-2 mb-4">
            <div className="col-span-3 ">Title</div>
            <div className="col-span-1 text-right pr-5">Cited By</div>
            <div className="col-span-1 text-right pr-5">Year</div>
          </div>

          {profile.papers.map((paper, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 bg-neutral-900 rounded-xl p-4 hover:bg-neutral-700 cursor-pointer transition"
            >
              <div className="col-span-3 flex flex-col justify-between">
                <h2 className="text-lg font-semibold text-[var(--color-orange)]">
                  {paper.title}
                </h2>
                <p className="text-sm text-gray-400">{paper.authors}</p>
                <p className="text-sm text-gray-500 italic">{paper.journal}</p>
              </div>
              <span className="col-span-1 font-mono text-gray-200 text-right pr-5">
                {paper.citedBy}
              </span>
              <span className="col-span-1  text-gray-200 text-right">
                {paper.year}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section - Insights */}
      <div className="w-full md:w-1/4 backdrop-blur-lg bg-neutral-800 border border-neutral-700 rounded-lg p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-[var(--color-orange)] mb-4">
          Research Insights
        </h2>
        <p className="text-gray-400 leading-relaxed">
          Dr. Thompson’s work primarily focuses on making AI more efficient and
          applicable in real-world robotic systems. Recent papers emphasize
          transfer learning and optimization for embedded intelligence. The
          consistent citation count indicates impactful contributions across
          interdisciplinary fields.
        </p>
      </div>
    </div>
  );
}
