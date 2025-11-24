import React, { useState } from "react";
import { PlusCircle, XIcon } from "lucide-react";

export default function MyProfile() {
  const [newSearch, setNewSearch] = useState(false);
  const [loading, setLoading] = useState(false);

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
    stats: {
      totalCitations: 135,
      hIndex: 12,
      i10Index: 8,
      publications: 23
    }
  };

  const HeaderSection = () => (
    <header className="mb-4 w-full">
      {!newSearch ? (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--color-orange)] tracking-tight font-bungee">
              My Profile
            </h1>
            <p className="text-gray-400 mt-2 max-w-xl leading-relaxed">
              Manage your academic profile, publications, and research insights — everything in one place.
            </p>
          </div>
          <button
            onClick={() => setNewSearch(true)}
            className="flex items-center gap-2 bg-[var(--color-orange)] border border-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:scale-[1.03] active:scale-95 transition-all duration-300 shadow-lg"
          >
            <PlusCircle size={18} />
            <span className="text-sm font-bungee">Edit Profile</span>
          </button>
        </div>
      ) : (
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 w-full shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-[var(--color-orange)] tracking-tight font-bungee">
                Edit Profile
              </h1>
              <p className="text-gray-400 mt-2 max-w-xl leading-relaxed">
                Update your profile information and research details.
              </p>
            </div>
            <button
              onClick={() => { 
                setNewSearch(false);
                setLoading(false);
              }}
              className="flex items-center gap-2 bg-white/10 text-[var(--color-light)] border border-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:scale-[1.03] active:scale-95 transition-all duration-300 shadow-lg"
            >
              <XIcon size={18} />
              <span className="text-sm font-bungee">Close</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );

  const EditProfileSection = ({
    loading,
    setLoading,
  }: {
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
    return (
      <div className="flex flex-col items-center justify-center w-full mx-auto min-h-[50vh]">
        {!loading ? (
          <>
            <div className="mb-10 py-2 text-center">
              <p className="text-2xl text-[var(--color-light)] font-semibold">
                Profile Editor Coming Soon...
              </p>
              <p className="text-gray-400 mt-4">
                Advanced profile editing features are under development.
              </p>
            </div>
            <button
              onClick={() => setLoading(true)}
              className="flex items-center gap-2 bg-[var(--color-orange)] border border-white/10 backdrop-blur-sm px-6 py-3 rounded-lg hover:scale-[1.03] active:scale-95 transition-all duration-300 shadow-lg"
            >
              <span className="text-sm font-bungee">Preview Editor</span>
            </button>
          </>
        ) : (
          <div className="w-full">
            <div className='flex items-center gap-2 my-6 p-2'>
              <h2 className="text-xl font-bold text-[var(--color-light)]">Profile Preview:</h2>
              <p>Edit your academic information</p>
            </div>
            <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
              <p className="text-gray-400 text-center text-lg">
                Profile editor interface will be available in the next update.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="flex-1 min-h-screen w-full text-[var(--color-light)] overflow-y-auto">
      <div className="max-w-screen mx-auto px-6 pt-10 flex flex-col">
        <HeaderSection />
        
        {!newSearch ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Section - Main Content */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Profile Header Card */}
              <div className="backdrop-blur-lg bg-neutral-800 border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-[var(--color-orange)] flex items-center justify-center shadow-2xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-white"
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
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white/20 flex items-center justify-center shadow-lg">
                      <span className="text-xs text-white">✓</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold bg-[var(--color-orange)] bg-clip-text text-transparent">
                      {profile.name}
                    </h1>
                    <p className="text-gray-300 text-lg mt-2 flex items-center gap-3">
                      <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">🏛️</span>
                      {profile.institution}
                    </p>
                    <p className="text-gray-300 mt-2 flex items-center gap-3">
                      <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">📧</span>
                      {profile.email}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                      {profile.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-sm text-[var(--color-orange)] hover:bg-white/20 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                        >
                          #{interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
                  {[
                    { value: profile.stats.totalCitations, label: "Total Citations" },
                    { value: profile.stats.hIndex, label: "h-index" },
                    { value: profile.stats.i10Index, label: "i10-index" },
                    { value: profile.stats.publications, label: "Publications" }
                  ].map((stat, index) => (
                    <div 
                      key={index}
                      className="text-center p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[var(--color-orange)]/30 transition-all duration-300 backdrop-blur-sm"
                    >
                      <div className="text-2xl font-bold text-[var(--color-orange)]">{stat.value}</div>
                      <div className="text-sm text-gray-300 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Publications Section */}
              <div className="backdrop-blur-lg bg-neutral-800  border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-[var(--color-orange)] bg-clip-text text-transparent">
                    Recent Publications
                  </h2>
                  <button className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-all duration-300 text-sm backdrop-blur-sm shadow-lg">
                    View All →
                  </button>
                </div>

                <div className="space-y-4">
                  {profile.papers.map((paper, index) => (
                    <div
                      key={index}
                      className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-[var(--color-orange)]/30 hover:bg-white/10 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-orange)]/20 to-orange-600/20 border border-[var(--color-orange)]/30 rounded-xl flex items-center justify-center text-[var(--color-orange)] font-bold text-sm backdrop-blur-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white group-hover:text-[var(--color-orange)] transition-colors duration-300">
                                {paper.title}
                              </h3>
                              <p className="text-gray-300 text-sm mt-2">{paper.authors}</p>
                              <p className="text-gray-400 text-sm italic mt-1">{paper.journal}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[var(--color-orange)]">{paper.citedBy}</div>
                            <div className="text-xs text-gray-300 mt-1">Citations</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{paper.year}</div>
                            <div className="text-xs text-gray-300 mt-1">Year</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Section - Insights */}
            <div className="w-full lg:w-96">
              <div className="backdrop-blur-lg bg-neutral-800 border border-white/10 rounded-2xl p-8 shadow-2xl sticky top-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-orange)]/20 to-orange-600/20 border border-[var(--color-orange)]/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-6 h-6 text-[var(--color-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold bg-[var(--color-orange)] bg-clip-text text-transparent">
                    Research Insights
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed text-lg">
                    Dr. Thompson's work primarily focuses on making AI more efficient and applicable in real-world robotic systems.
                  </p>
                  
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                    <h4 className="font-semibold text-[var(--color-orange)] mb-3">Research Focus</h4>
                    <ul className="text-gray-300 text-sm space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[var(--color-orange)] rounded-full"></div>
                        Transfer learning optimization
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[var(--color-orange)] rounded-full"></div>
                        Embedded AI systems
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[var(--color-orange)] rounded-full"></div>
                        Robotic perception
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[var(--color-orange)] rounded-full"></div>
                        Edge computing
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                    <h4 className="font-semibold text-[var(--color-orange)] mb-3">Impact Metrics</h4>
                    <div className="text-gray-300 text-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Citation Growth:</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs">+24% YoY</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Collaboration Index:</span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs">High</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Field Influence:</span>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs">Top 10%</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full py-4 bg-[var(--color-orange)] rounded-xl hover:scale-[1.02] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                    Generate Full Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EditProfileSection loading={loading} setLoading={setLoading} />
        )}
      </div>
    </main>
  );
}