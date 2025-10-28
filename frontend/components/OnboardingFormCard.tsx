import React, { useState } from "react";
import { User, GraduationCap, Target, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  name: string;
  email: string;
  academicLevel: string;
  field: string;
  subfield: string;
  researchDescription: string;
  keywords: string;
  researchQuestion: string;
  paperTypes: string[];
  recencyPreference: string;
  authors: string;
  goals: string[];
}

const initialData: FormData = {
  name: "",
  email: "",
  academicLevel: "",
  field: "",
  subfield: "",
  researchDescription: "",
  keywords: "",
  researchQuestion: "",
  paperTypes: [],
  recencyPreference: "",
  authors: "",
  goals: []
};

const stepsMeta = [
  { id: 1, short: "Profile", title: "Tell us about you", icon: <User size={18} /> },
  { id: 2, short: "Academic", title: "Your academic background", icon: <GraduationCap size={18} /> },
  { id: 3, short: "Research", title: "Your research interests", icon: <GraduationCap size={18} /> },
  { id: 4, short: "Prefs", title: "How do you want results?", icon: <Target size={18} /> },
  { id: 5, short: "Finish", title: "Review & save", icon: <CheckCircle size={18} /> }
];

export default function OnboardingFullFlow(): JSX.Element {
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<FormData>(initialData);
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const total = stepsMeta.length;

  const update = (patch: Partial<FormData>) => setData((d) => ({ ...d, ...patch }));

  const toggle = (key: keyof FormData, value: string) => {
    setData((d) => {
      const arr = (d[key] as unknown as string[]) || [];
      return { ...d, [key]: arr.includes(value) ? arr.filter((a) => a !== value) : [...arr, value] } as FormData;
    });
  };

  // Step validation (kept simple and non-blocking for UX)
  const valid = (s: Step) => {
    switch (s) {
      case 1:
        return data.name.trim().length > 1 && /.+@.+\..+/.test(data.email);
      case 2:
        return data.academicLevel.trim().length > 0 && data.field.trim().length > 0;
      case 3:
        return data.researchDescription.trim().length > 8;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const percent = Math.round(((step - 1) / (total - 1)) * 100);

  const next = () => {
    if (!valid(step)) return;
    setStep((p) => Math.min(p + 1 as Step, total as Step));
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
    setStep(total as Step);
    
    setTimeout(() => {
      navigate("/");
    }, 1000);  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-neutral-900">
      {/* Medium width centered container */}
      <div className="w-full max-w-3xl">
        {/* Card */}
        <div className="rounded-2xl overflow-hidden shadow-lg bg-neutral-800 border border-neutral-600">

          {/* Top area: progress bar + step label */}
          <div className="px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-gray-300">Step {step} of {total}</div>
                <h2 className="mt-4 text-3xl font-semibold text-[var(--color-orange)] font-bungee">{stepsMeta[step - 1].title}</h2>
                <p className="mt-4 text-sm text-gray-300">{stepsMeta[step - 1].short} — {stepsMeta[step - 1].title}</p>
              </div>

              <div className="flex items-center gap-3">
                {/* icon */}
                <div className="p-2 rounded-md text-[var(--color-gray)] bg-[var(--color-orange)] ">
                  {React.cloneElement(stepsMeta[step - 1].icon as any)}
                </div>
              </div>
            </div>

            {/* Solid progress bar */}
            <div className="mt-4 w-full bg-white/6 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all bg-[var(--color-orange)]`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/6" />

          {/* Body */}
          <div className="px-8 py-8">
            {/* Wide layout fields (two columns on md+) */}
            <div className="space-y-6">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Full name</label>
                    <input value={data.name} onChange={(e) => update({ name: e.target.value })} placeholder="e.g., Updating me" className="w-full rounded-lg bg-[#0f0f10] border border-white/6 p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Email</label>
                    <input value={data.email} onChange={(e) => update({ email: e.target.value })} placeholder="updating@jklu.edu.in" className="w-full rounded-lg bg-[#0f0f10] border border-white/6 p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Academic level</label>
                    <select value={data.academicLevel} onChange={(e) => update({ academicLevel: e.target.value })} className="w-full rounded-lg bg-[#0f0f10] border border-white/6 p-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]">
                      <option value="">Select level</option>
                      <option>Undergraduate</option>
                      <option>Master's Student</option>
                      <option>PhD Researcher</option>
                      <option>Postdoc</option>
                      <option>Professor</option>
                      <option>Industry Researcher</option>
                      <option>Independent Researcher</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Primary field</label>
                    <input value={data.field} onChange={(e) => update({ field: e.target.value })} placeholder="Computer Science" className="w-full rounded-lg bg-[#0f0f10] border border-white/6 p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-300 mb-1 block">Subfield / domain</label>
                    <input value={data.subfield} onChange={(e) => update({ subfield: e.target.value })} placeholder="e.g., Natural Language Processing" className="w-full rounded-lg bg-[#0f0f10] border border-white/6 p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Short research description</label>
                    <textarea value={data.researchDescription} onChange={(e) => update({ researchDescription: e.target.value })} placeholder="2-3 lines about what you study" className="w-full rounded-lg bg-[#0f0f10] border border-white/6 p-3 text-white placeholder:text-gray-500 h-28 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-300 mb-1 block">Keywords (comma separated)</label>
                      <input value={data.keywords} onChange={(e) => update({ keywords: e.target.value })} placeholder="transformers, vision, reinforcement learning" className="w-full rounded-lg bg-[#0f0f10] border border-white/6 p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]" />
                    </div>

                    <div>
                      <label className="text-sm text-gray-300 mb-1 block">Research question (optional)</label>
                      <input value={data.researchQuestion} onChange={(e) => update({ researchQuestion: e.target.value })} placeholder="One-sentence question you're exploring" className="w-full rounded-lg bg-[#0f0f10] border border-white/6 p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]" />
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Preferred recency</label>
                    <select value={data.recencyPreference} onChange={(e) => update({ recencyPreference: e.target.value })} className="w-full rounded-lg bg-[#0f0f10] border border-white/6 p-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]">
                      <option value="">No preference</option>
                      <option>Last 6 months</option>
                      <option>Last 2 years</option>
                      <option>Last 5 years</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Followed authors / labs</label>
                    <input value={data.authors} onChange={(e) => update({ authors: e.target.value })} placeholder="Yann LeCun, DeepMind" className="w-full rounded-lg bg-[#0f0f10] border border-white/6 p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]" />
                  </div>

                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Preferred paper types</label>
                    <div className="flex flex-wrap gap-2">
                      {['Survey','Experimental','Theoretical','Benchmark','Code/Implementation'].map((p) => (
                        <button key={p} type="button" onClick={() => toggle('paperTypes', p)} className={`px-3 py-1 rounded-full border cursor-pointer ${data.paperTypes.includes(p) ? 'bg-[var(--color-orange)] text-black' : 'bg-transparent text-gray-300 border-white/10'}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <div className="bg-white/3 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-200">
                      <div>
                        <div className="text-xs text-gray-400">Name</div>
                        <div className="mt-1 text-white">{data.name || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Email</div>
                        <div className="mt-1 text-white">{data.email || '-'}</div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-400">Academic level</div>
                        <div className="mt-1 text-white">{data.academicLevel || '-'}</div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-400">Field</div>
                        <div className="mt-1 text-white">{data.field || '-'}</div>
                      </div>

                      <div className="md:col-span-2">
                        <div className="text-xs text-gray-400">Research</div>
                        <div className="mt-1 text-white">{data.researchDescription || '-'}</div>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" className="w-4 h-4 rounded-sm bg-[#0f0f10] border-white/8" />
                    I agree to use these preferences to personalize my experience.
                  </label>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <div>
                {step > 1 ? (
                  <button onClick={back} className="px-4 py-2 rounded-md font-bungee cursor-pointer text-gray-200 bg-white/6 hover:bg-white/20 transition">
                    ← Back
                  </button>
                ) : (
                  <div />
                )}
              </div>

              <div className="flex items-center gap-3">
                {step < total ? (
                  <button onClick={next} disabled={!valid(step)} className={`px-6 py-2 rounded-md text-white font-bungee ${valid(step) ? 'bg-[var(--color-orange)] cursor-pointer' : 'bg-white/10 cursor-not-allowed'} transition`}> 
                    Next →
                  </button>
                ) : (
                  <button onClick={submit} disabled={submitting} className={`px-6 py-2 rounded-md text-white font-bungee bg-[var(--color-orange)] cursor-pointer ${submitting ? 'opacity-70' : ''}`}>
                    {submitting ? 'Saving...' : 'Finish & Save'}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer small hint */}
        <div className="mt-6 text-center text-xs text-gray-400">You can update these preferences anytime in your profile.</div>
      </div>
    </div>
  );
}