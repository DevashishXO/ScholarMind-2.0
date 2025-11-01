import { CheckCircle, BookOpen, Sparkles, } from "lucide-react";

import { FormData } from "../../lib/types";

// Mock data for hierarchical topics
const topicHierarchy = {
  "Computer Science": {
    "Artificial Intelligence": ["Machine Learning", "Natural Language Processing", "Computer Vision", "Robotics"],
    "Systems": ["Operating Systems", "Databases", "Computer Networks"],
    "Theory": ["Algorithms", "Cryptography", "Quantum Computing"]
  },
};

type renderTopicTreeProps = {
  data: FormData;
  setData: React.Dispatch<React.SetStateAction<FormData>>;
};

export default function renderTopicTree({ data, setData }: renderTopicTreeProps){
  
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