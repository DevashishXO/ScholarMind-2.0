import React, { useState } from "react";
import { User, GraduationCap, Target, CheckCircle, XCircle, BookOpen, Link, Users, Sparkles, Lightbulb, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  // Step 1
  role: string;
  academicLevel: string;
  
  // Step 2
  institution: string;
  highestDegree: string;
  primaryField: string;
  
  // Step 3
  googleScholarUrl: string;
  otherLinks: string;
  researchDescription: string;
  researchInterests: string[];
  recentPublications: string;
  
  // Step 4
  activeTopics: string[];
  learningTopics: string[];
  
  // Step 5
  goals: string[];
}

const initialData: FormData = {
  role: "",
  academicLevel: "",
  institution: "",
  highestDegree: "",
  primaryField: "",
  googleScholarUrl: "",
  otherLinks: "",
  researchDescription: "",
  researchInterests: [],
  recentPublications: "",
  activeTopics: [],
  learningTopics: [],
  goals: []
};

const stepsMeta = [
  { id: 1, short: "User", title: "Welcome & Role Selection", icon: <User size={18} /> },
  { id: 2, short: "Academic", title: "Academic Background", icon: <GraduationCap size={18} /> },
  { id: 3, short: "Research", title: "Research Background", icon: <BookOpen size={18} /> },
  { id: 4, short: "Topics", title: "Research Topic Selection", icon: <Target size={18} /> },
  { id: 5, short: "Goals", title: "Your Goals", icon: <CheckCircle size={18} /> }
];

// Mock data for hierarchical topics
const topicHierarchy = {
  "Computer Science": {
    "Artificial Intelligence": ["Machine Learning", "Natural Language Processing", "Computer Vision", "Robotics"],
    "Systems": ["Operating Systems", "Databases", "Computer Networks"],
    "Theory": ["Algorithms", "Cryptography", "Quantum Computing"]
  },
};

const academicLevelsByRole: Record<string, string[]> = {
  "Student": ["Undergraduate", "Master's Student", "PhD Student"],
  "Professor": ["Assistant Professor", "Associate Professor", "Full Professor"],
  "Researcher": ["Postdoc", "Research Scientist", "Principal Investigator"],
  "Industry": ["Junior Researcher", "Senior Researcher", "Research Lead", "CTO"]
};

export default function OnboardingFullFlow(): JSX.Element {
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<FormData>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);

  const navigate = useNavigate();

  const total = stepsMeta.length;

  const update = (patch: Partial<FormData>) => setData((d) => ({ ...d, ...patch }));

  const toggle = (key: keyof FormData, value: string) => {
    setData((d) => {
      const arr = (d[key] as unknown as string[]) || [];
      return { 
        ...d, 
        [key]: arr.includes(value) 
          ? arr.filter((a) => a !== value) 
          : [...arr, value] 
      } as FormData;
    });
  };

  const toggleTopic = (topic: string, type: 'active' | 'learning') => {
    const key = type === 'active' ? 'activeTopics' : 'learningTopics';
    const otherKey = type === 'active' ? 'learningTopics' : 'activeTopics';
    
    setData((d) => {
      const currentArray = d[key];
      const otherArray = d[otherKey];
      
      // Remove from other array if exists
      const newOtherArray = otherArray.filter(t => t !== topic);
      
      // Toggle in current array
      const newArray = currentArray.includes(topic) 
        ? currentArray.filter(t => t !== topic)
        : [...currentArray, topic];
      
      return {
        ...d,
        [key]: newArray,
        [otherKey]: newOtherArray
      };
    });
  };

  // Step validation
  const valid = (s: Step) => {
    switch (s) {
      case 1:
        return data.role.trim().length > 0 && data.academicLevel.trim().length > 0;
      case 2:
        return data.institution.trim().length > 0 && data.primaryField.trim().length > 0;
      case 3:
        return data.researchDescription.trim().length > 8;
      case 4:
        return data.activeTopics.length > 0;
      case 5:
        return data.goals.length > 0;
      default:
        return true;
    }
  };

  const percent = Math.round(((step - 1) / (total - 1)) * 100);

  const next = () => {
    if (!valid(step)) return;
    setStep((p) => Math.min((p + 1) as Step, total as Step));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => setStep((p) => Math.max(1, (p - 1) as number) as Step);

  const submit = async () => {
    if (!valid(step)) return;
    setSubmitting(true);
    // replace with real save API
    await new Promise((r) => setTimeout(r, 800));
    console.log("onboarding payload", data);
    setSubmitting(false);

    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  // Skip handlers
  const openSkipModal = () => setShowSkipModal(true);
  const closeSkipModal = () => setShowSkipModal(false);
  const confirmSkip = () => {
    console.log("✅ User skipped onboarding");
    navigate("/");
  };

  const renderTopicTree = () => {
    return (
      <div className="space-y-10">
        {Object.entries(topicHierarchy).map(([field, subfields]) => (
          <div
            key={field}
            className="rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/80 to-zinc-800/60 p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">{field}</h3>
            </div>
  
            <div className="space-y-6">
              {Object.entries(subfields).map(([subfield, topics]) => (
                <div key={subfield} className="">
                  <h4 className="text-md font-medium text-gray-300 mb-3">
                    {subfield}
                  </h4>
  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {topics.map((topic) => (
                      <div
                        key={topic}
                        className="flex items-center gap-2 bg-white/5 rounded-lg p-2.5 border border-white/10 hover:border-white/20 transition-colors"
                      >
                        <div className="flex-1 text-gray-200 text-sm truncate">
                          {topic}
                        </div>
  
                        {/* Active button */}
                        <button
                          type="button"
                          onClick={() => toggleTopic(topic, "active")}
                          className={`p-1.5 rounded-md transition cursor-pointer ${
                            data.activeTopics.includes(topic)
                              ? "bg-green-600/20 text-green-400"
                              : "text-gray-400 hover:text-green-400 hover:bg-green-500/10"
                          }`}
                          title="Mark as Active"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
  
                        {/* Learning button */}
                        <button
                          type="button"
                          onClick={() => toggleTopic(topic, "learning")}
                          className={`p-1.5 rounded-md transition cursor-pointer ${
                            data.learningTopics.includes(topic)
                              ? "bg-blue-600/20 text-blue-400"
                              : "text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                          }`}
                          title="Mark as Learning"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
  
        {/* 🧭 Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Active */}
          <div className="rounded-2xl border border-green-500/20 bg-green-950/20 p-5">
            <h4 className="text-green-300 font-semibold flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4" /> Active Topics
              <span className="text-xs bg-green-600/30 text-green-200 px-2 py-0.5 rounded-full">
                {data.activeTopics.length}
              </span>
            </h4>
            {data.activeTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.activeTopics.map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-green-500/20 text-green-200 px-2 py-1 rounded-md border border-green-500/30"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-green-200/70">No active topics</p>
            )}
          </div>
  
          {/* Learning */}
          <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-5">
            <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4" /> Learning Topics
              <span className="text-xs bg-blue-600/30 text-blue-200 px-2 py-0.5 rounded-full">
                {data.learningTopics.length}
              </span>
            </h4>
            {data.learningTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.learningTopics.map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-blue-500/20 text-blue-200 px-2 py-1 rounded-md border border-blue-500/30"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-blue-200/70">No learning topics</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-neutral-900">
      {/* Medium width centered container */}
      <div className="w-full max-w-3xl">
        {/* Card */}
        <div className="rounded-2xl overflow-hidden shadow-lg bg-neutral-800 border border-neutral-600 relative">
          {/* Skip Button - only visible on Step 1 */}
          {step === 1 && (
            <button
              onClick={openSkipModal}
              className="absolute top-6 right-6 text-sm text-gray-300 hover:text-[var(--color-orange)] transition"
            >
              Skip →
            </button>
          )}

          {/* Top area: progress bar + step label */}
          <div className="px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-gray-300">Step {step} of {total}</div>
                <h2 className="mt-4 text-3xl font-semibold text-[var(--color-orange)] font-bungee">
                  {stepsMeta[step - 1]?.title}
                </h2>
                <p className="mt-4 text-sm text-gray-300">
                  {stepsMeta[step - 1]?.short} — {stepsMeta[step - 1]?.title}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md text-gray-900 bg-[var(--color-orange)] cursor-pointer">
                  {React.cloneElement(stepsMeta[step - 1]?.icon as React.ReactElement)}
                </div>
              </div>
            </div>

            {/* Solid progress bar */}
            <div className="mt-4 w-full bg-white/6 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all bg-[var(--color-orange)]"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/6" />

          {/* Body */}
          <div className="px-8 py-8">
            {/* Step content */}
            <div className="space-y-6">
              {/* Step 1: Welcome & Role Selection */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm text-gray-300 mb-3 block">Select your primary role</label>
                    <div className="grid grid-cols-2 gap-4">
                      {["Student", "Professor", "Researcher", "Industry"].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            update({ role });
                            update({ academicLevel: "" }); // Reset academic level when role changes
                          }}
                          className={`p-4 rounded-lg border-2 text-center transition-all cursor-pointer font-bungee ${
                            data.role === role
                              ? 'bg-[var(--color-orange)] border-neutral-200 text-white'
                              : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {data.role && (
                    <div>
                      <label className="text-sm text-gray-300 mb-1 block">Academic Level</label>
                      <select 
                        value={data.academicLevel} 
                        onChange={(e) => update({ academicLevel: e.target.value })} 
                        className="w-full rounded-lg bg-neutral-900 cursor-pointer border border-white/6 p-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]"
                      >
                        <option value="">Select level</option>
                        {academicLevelsByRole[data.role]?.map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Academic Background */}
              {step === 2 && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Institution</label>
                    <input 
                      value={data.institution} 
                      onChange={(e) => update({ institution: e.target.value })} 
                      placeholder="e.g., Indian Institute of Technology, Kanpur"
                      className="w-full rounded-lg bg-neutral-900 cursor-pointer border border-white/6 p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-300 mb-1 block">Highest Degree</label>
                      <select 
                        value={data.highestDegree} 
                        onChange={(e) => update({ highestDegree: e.target.value })} 
                        className="w-full rounded-lg bg-neutral-900 border border-white/6 p-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]"
                      >
                        <option value="">Select degree</option>
                        <option value="Bachelor's">Bachelor's</option>
                        <option value="Master's">Master's</option>
                        <option value="PhD">PhD</option>
                        <option value="Postdoc">Postdoc</option>
                        <option value="None">None</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-300 mb-1 block">Primary Field of Research</label>
                      <input 
                        value={data.primaryField} 
                        onChange={(e) => update({ primaryField: e.target.value })} 
                        placeholder="e.g., Computer Science, Biology, Physics"
                        className="w-full rounded-lg bg-neutral-900 border border-white/6 p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Research Background */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-300 mb-1 block flex items-center gap-2">
                        <Link size={16} />
                        Google Scholar URL
                      </label>
                      <input 
                        value={data.googleScholarUrl} 
                        onChange={(e) => update({ googleScholarUrl: e.target.value })} 
                        placeholder="https://scholar.google.com/citations?user=..."
                        className="w-full rounded-lg bg-neutral-900 border border-white/6 p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]" 
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-300 mb-1 block">Other Research Links</label>
                      <input 
                        value={data.otherLinks} 
                        onChange={(e) => update({ otherLinks: e.target.value })} 
                        placeholder="ORCID, ResearchGate, Personal website..."
                        className="w-full rounded-lg bg-neutral-900 border border-white/6 p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Short Research Description</label>
                    <textarea 
                      value={data.researchDescription} 
                      onChange={(e) => update({ researchDescription: e.target.value })} 
                      placeholder="Describe your current research focus, methods, and objectives (2-3 sentences)"
                      className="w-full rounded-lg bg-neutral-900 border border-white/6 p-3 text-white placeholder:text-gray-500 h-28 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]" 
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Top Research Interests</label>
                      <input 
                        value={data.researchInterests.join(", ")} 
                        onChange={(e) => update({ researchInterests: e.target.value.split(", ").filter(Boolean) })} 
                        placeholder="Machine Learning, Natural Language Processing, Computer Vision"
                        className="w-full rounded-lg bg-neutral-900 border border-white/6 p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]" 
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-300 mb-1 block">Recent Publications (optional)</label>
                      <input 
                        value={data.recentPublications} 
                        onChange={(e) => update({ recentPublications: e.target.value })} 
                        placeholder="arXiv, conference, or journal links"
                        className="w-full rounded-lg bg-neutral-900 border border-white/6 p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Research Topic Selection */}              
              {step === 4 && (
                <div className="space-y-6">
                  {/* Header Section */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <h3 className="text-xl font-semibold text-white">
                        Select Your Research Topics
                      </h3>
                    </div>
              
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Tag your topics to help personalize your research assistant:
                    </p>
              
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                      <div className="flex items-center gap-1.5 text-green-300">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Currently Active</span>
                        <span className="text-gray-400">(3–4 topics you're working on)</span>
                      </div>
              
                      <div className="flex items-center gap-1.5 text-gray-400">•</div>
              
                      <div className="flex items-center gap-1.5 text-blue-300">
                        <GraduationCap className="w-4 h-4" />
                        <span className="font-medium">Want to Learn</span>
                        <span className="text-gray-400">(2–3 topics to explore)</span>
                      </div>
                    </div>
                  </div>
              
                  {/* Topic Tree */}
                  <div className="border-t border-white/10 pt-4">
                    {renderTopicTree()}
                  </div>
                </div>
              )}

              {/* Step 5: Goals */}
              {step === 5 && (
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      What brings you here?
                    </h3>
                    <p className="text-sm text-gray-400">
                      Select all that apply — this helps tailor your experience.
                    </p>
                  </div>
              
                  {/* Goals Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Literature review for my research", icon: BookOpen },
                      { label: "Learning a new field", icon: Lightbulb },
                      { label: "Staying updated in my area", icon: RefreshCcw },
                      { label: "Finding collaboration opportunities", icon: Users },
                    ].map(({ label, icon: Icon }) => {
                      const isSelected = data.goals.includes(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => toggle("goals", label)}
                          className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer font-bungee
                            ${
                              isSelected
                                ? "border-[var(--color-orange)] bg-[var(--color-orange)] text-[var(--color-light)] shadow-md shadow-orange-900/10"
                                : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10"
                            }`}
                        >
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                              isSelected
                                ? "bg-[var(--color-orange)] text-[var(--color-light)]"
                                : "bg-white/10 text-gray-400"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-medium leading-snug">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <div>
                {step > 1 ? (
                  <button 
                    onClick={back} 
                    className="px-4 py-2 rounded-md font-bungee cursor-pointer text-gray-200 bg-white/6 hover:bg-white/20 transition"
                  >
                    ← Back
                  </button>
                ) : (
                  <div />
                )}
              </div>

              <div className="flex items-center gap-3">
                {step < total ? (
                  <button 
                    onClick={next} 
                    disabled={!valid(step)} 
                    className={`px-6 py-2 rounded-md text-white font-bungee ${
                      valid(step) 
                        ? 'bg-[var(--color-orange)] cursor-pointer hover:opacity-90' 
                        : 'bg-white/10 cursor-not-allowed'
                    } transition`}
                  > 
                    Next →
                  </button>
                ) : (
                  <button 
                    onClick={submit} 
                    disabled={submitting} 
                    className={`px-6 py-2 rounded-md text-white font-bungee bg-[var(--color-orange)] cursor-pointer ${
                      submitting ? 'opacity-70' : 'hover:opacity-90'
                    }`}
                  >
                    {submitting ? 'Saving...' : 'Finish & Save'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer small hint */}
        <div className="mt-6 text-center text-xs text-gray-400">
          You can update these preferences anytime in your profile.
        </div>
      </div>

      {/* Skip Confirmation Modal */}
      {showSkipModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={closeSkipModal}
        >
          <div
            className="bg-neutral-800/50 border border-white/6 backdrop-blur-md p-6 rounded-xl w-[90%] max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center mb-3">
              <XCircle size={44} className="text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-center text-[var(--color-orange)]">Skip Onboarding?</h3>
            <p className="text-center text-gray-300 mt-2">
              Are you sure you want to skip onboarding? You can finish it later from your profile.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeSkipModal}
                className="px-4 py-2 bg-neutral-700 rounded-md hover:bg-neutral-600 transition text-white cursor-pointer font-bungee"
              >
                Cancel
              </button>
              <button
                onClick={confirmSkip}
                className="px-4 py-2 bg-[var(--color-orange)] text-white font-semibold rounded-md hover:opacity-90 transition cursor-pointer font-bungee"
              >
                Yes, Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}