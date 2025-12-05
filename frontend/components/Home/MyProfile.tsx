// pages/MyProfile.tsx  (or wherever your component lives)
import React, { useMemo, useState } from "react";
import { PlusCircle, XIcon, User } from "lucide-react";
import { useProfile } from "../../src/hooks/useProfile";
import type { Profile, Publication } from "../../lib/profile.types";
import PublicationModal from "../../components/MyProfile/PublicationModal";

export default function MyProfile() {
  const [editing, setEditing] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const { loading: profileLoading, data: profileDataRaw } = useProfile() as {
    loading: boolean;
    data: Profile | null;
  };

  // selected publication for modal
  const [selected, setSelected] = useState<Publication | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const profileData = profileDataRaw;

  const stats = useMemo(() => {
    const metrics = profileData?.scholarlyProfile?.metrics;
    return [
      { value: metrics?.citations?.all ?? 0, label: "Total Citations" },
      { value: (metrics?.h_index as any)?.all ?? (metrics?.h_index ?? 0), label: "h-index" },
      // i10_index can be number or object
      {
        value:
          typeof profileData?.scholarlyProfile?.metrics?.i10_index === "number"
            ? profileData.scholarlyProfile.metrics.i10_index
            : (profileData?.scholarlyProfile?.metrics?.i10_index as any)?.all ?? 0,
        label: "i10-index",
      },
      { value: profileData?.scholarlyProfile?.publications?.length ?? 0, label: "Publications" },
    ];
  }, [profileData]);

  // if profileLoading or status is not completed
  if (profileLoading && profileDataRaw?.scholarlyProfileStatus !== "completed") {
    return (
      <main className="flex-1 min-h-screen w-full bg-neutral-900 text-[var(--color-light)] flex items-center justify-center">
        <div className="text-center">
          {/* Simple animated logo matching your chat interface */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-[var(--color-orange)] flex items-center justify-center animate-pulse">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -inset-4">
              <div className="w-full h-full border-2 border-[var(--color-orange)]/20 rounded-xl animate-ping"></div>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2 font-bungee">Loading</h3>
          
          {/* Typing indicator similar to your chat */}
          <div className="flex items-center justify-center gap-1">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-[var(--color-orange)] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-1.5 h-1.5 bg-[var(--color-orange)] rounded-full animate-bounce" style={{animationDelay: '100ms'}}></div>
              <div className="w-1.5 h-1.5 bg-[var(--color-orange)] rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
            </div>
            <span className="text-neutral-400 text-sm ml-2">Fetching profile data</span>
          </div>
        </div>
      </main>
    );
  }

  if (!profileData) {
    return (
      <main className="flex-1 min-h-screen w-full text-[var(--color-light)] flex items-center justify-center">
        <p>No profile found</p>
      </main>
    );
  }

  const openPublication = (pub: Publication) => {
    setSelected(pub);
    setModalOpen(true);
  };

  return (
    <main className="flex-1 min-h-screen w-full text-[var(--color-light)] overflow-y-auto">
      <div className="max-w-screen mx-auto px-6 pt-10 flex flex-col gap-6">
        {/* Header */}
        <header className=" w-full">
          {!editing ? (
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
                onClick={() => setEditing(true)}
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
                    setEditing(false);
                    setPreviewLoading(false);
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

        {/* main content */}
        {!editing ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Profile Header */}
              <div className="backdrop-blur-lg bg-neutral-800 border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group">
                    <img
                      src={profileData.picture ?? profileData.scholarlyProfile?.profile_picture ?? "/avatar-placeholder.png"}
                      alt={profileData.name}
                      className="w-24 h-24 rounded-2xl object-cover shadow-2xl"
                    />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white/20 flex items-center justify-center shadow-lg">
                      <span className="text-xs text-white">✓</span>
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold bg-[var(--color-orange)] bg-clip-text text-transparent">
                      {profileData.name}
                    </h1>

                    <p className="text-gray-300 text-lg mt-2 flex items-center gap-3">
                      <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        🏛️
                      </span>
                      {profileData.institution ?? profileData.scholarlyProfile?.affiliation}
                    </p>

                    <p className="text-gray-300 mt-2 flex items-center gap-3">
                      <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        📧
                      </span>
                      {profileData.email}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                      {profileData.scholarlyProfile?.interests?.map((interest, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-sm text-[var(--color-orange)] hover:bg-white/20 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                        >
                          #{interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
                  {stats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="text-center p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[var(--color-orange)]/30 transition-all duration-300 backdrop-blur-sm"
                    >
                      <div className="text-2xl font-bold text-[var(--color-orange)]">{stat.value}</div>
                      <div className="text-sm text-gray-300 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Publications */}
              <div className="backdrop-blur-lg bg-neutral-800 border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-[var(--color-orange)] bg-clip-text text-transparent">
                    Recent Publications
                  </h2>

                  <button className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-all duration-300 text-sm backdrop-blur-sm shadow-lg">
                    View All →
                  </button>
                </div>

                <div className="space-y-4">
                  {profileData.scholarlyProfile?.publications?.map((pub, index) => (
                    <div
                      key={index}
                      onClick={() => openPublication(pub)}
                      role="button"
                      tabIndex={0}
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
                                {pub.title}
                              </h3>
                              <p className="text-gray-300 text-sm mt-2">{pub.authors}</p>
                              <p className="text-gray-400 text-sm italic mt-1">{pub.publisher ?? pub.venue}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[var(--color-orange)]">{pub.citation_count}</div>
                            <div className="text-xs text-gray-300 mt-1">Citations</div>
                          </div>

                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{pub.year}</div>
                            <div className="text-xs text-gray-300 mt-1">Year</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
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
                    {profileData.researchDescription ?? `${profileData.name} — research summary not provided.`}
                  </p>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                    <h4 className="font-semibold text-[var(--color-orange)] mb-3">Research Focus</h4>
                    <ul className="text-gray-300 text-sm space-y-2">
                      {(profileData.researchInterests ?? profileData.scholarlyProfile?.interests ?? []).slice(0, 6).map((r, idx) => (
                        <li className="flex items-center gap-2" key={idx}>
                          <div className="w-1.5 h-1.5 bg-[var(--color-orange)] rounded-full" />
                          {r}
                        </li>
                      ))}
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
          // Edit profile preview (keeps same look) - no change in UI
          <div className="flex items-center justify-center min-h-[50vh]">
            {!previewLoading ? (
              <div className="text-center">
                <h3 className="text-2xl font-semibold">Profile Editor Coming Soon...</h3>
                <p className="text-gray-400 mt-3">Advanced profile editing features are under development.</p>
                <div className="mt-6">
                  <button onClick={() => setPreviewLoading(true)} className="px-6 py-2 rounded-lg bg-[var(--color-orange)]">Preview Editor</button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-8">
                <h4 className="text-lg font-semibold text-[var(--color-orange)]">Profile Preview</h4>
                <p className="text-gray-300 mt-3">Profile editor interface will be available in the next update.</p>
              </div>
            )}
          </div>
        )}

        {/* Publication modal */}
        <PublicationModal
          open={modalOpen}
          publication={selected}
          onClose={() => {
            setModalOpen(false);
            setSelected(null);
          }}
        />
      </div>
    </main>
  );
}
