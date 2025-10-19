import { useState } from "react";
import { ArrowLeft, MessageSquare, Bookmark, Plus, Download, ExternalLink, Quote } from "lucide-react";
import Overview from "../components/PaperView/Overview";
import AIInsights from "../components/PaperView/AIInsights";
import Citations from "../components/PaperView/Citations";
import Metrics from "../components/PaperView/Metrics";
import References from "../components/PaperView/References";
import SimilarPapers from "../components/PaperView/SimilarPapers";

const paper = {
  id: "PAPER-001",
  title: "Deep Learning for Natural Language Processing",
  authors: ["Andrew Ng", "Chris Manning", "Yoshua Bengio", "Joel Grus", "Yann LeCun"],
  abstract: `This paper provides a comprehensive overview of deep learning techniques applied to natural language processing (NLP). 
  We explore the evolution of neural network architectures from simple feedforward models to complex transformer-based models. 
  Key topics include word embeddings, recurrent neural networks (RNNs), long short-term memory networks (LSTMs), attention mechanisms, and pre-trained language models such as BERT and GPT. 
  The study highlights how these models enable machines to understand, generate, and interact with human language in tasks such as machine translation, sentiment analysis, text summarization, and question answering. 
  Furthermore, we discuss challenges such as data scarcity, interpretability, and computational efficiency. 
  Practical applications in industry, including chatbots, recommendation systems, and automated content analysis, are illustrated. 
  Finally, future research directions are outlined, emphasizing multi-modal learning, transfer learning, and ethical considerations in AI-driven language technologies. 
  The paper aims to serve both as an introductory guide for newcomers and a reference for researchers seeking a consolidated view of deep learning in NLP.`,
  type: "Journal",
  noOfCitations: 15230,
  year: 2019,
  keywords: [
    "Deep Learning",
    "NLP",
    "Transformers",
    "AI",
    "Word Embeddings",
    "RNN",
    "LSTM",
    "Attention Mechanism",
    "BERT",
    "GPT",
    "Language Models",
    "Text Summarization",
    "Machine Translation",
    "Sentiment Analysis",
    "Ethical AI"
  ],
  access: "Open Access",
  doi: "10.1001/dlnlp.2019.001",
  url: "https://example.com/nlp-paper",
  pdfUrl: "https://example.com/nlp-paper.pdf",
};


const options = ["Overview", "AI Insights", "Citations", "Metrics", "References", "Similar Papers"];

export default function PaperViewPage() {
  const [selectedTab, setSelectedTab] = useState("Overview");

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Overview":
        return <Overview abstract={paper.abstract} keywords={paper.keywords} />;
      case "AI Insights":
        return <AIInsights />;
      case "Citations":
        return <Citations />;
      case "Metrics":
        return <Metrics />;
      case "References":
        return <References />;
      case "Similar Papers":
        return <SimilarPapers />;
      default:
        return <Overview abstract={paper.abstract} keywords={paper.keywords} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-[var(--color-light)] flex flex-col">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center py-4 px-8 backdrop-blur-md bg-white/10 border-b border-white/10 shadow-lg sticky top-0 z-50 rounded-b-xl">
        <button className="flex items-center gap-2 text-sm hover:text-[var(--color-orange)] transition font-bungee">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="flex items-center gap-3 font-bungee">
          <button className="flex items-center gap-2 py-2 px-4 rounded-xl bg-[var(--color-orange)] shadow-lg hover:scale-105 transition active:scale-95">
            <MessageSquare size={20} /> Chat with Paper
          </button>
          <button className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm transition">
            <Bookmark size={20} /> Save
          </button>
          <button className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm transition">
            <Plus size={20} /> Add
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[80%] w-full mx-auto py-10 px-8">
        <h1 className="text-4xl font-semibold">{paper.title}</h1>
        <div className="flex gap-2 mt-4 text-lg text-neutral-300 flex-wrap">{paper.authors.join(", ")}</div>

        {/* Meta Info */}
        <div className="mt-6 flex gap-6 items-center text-lg">
          <span className="py-2 px-4 bg-[var(--color-orange)] rounded-xl">{paper.type}</span>
          <span>{paper.year}</span>
          <span>DOI: {paper.doi}</span>
        </div>

        {/* Citation Bar */}
        <div className="flex gap-12 mt-6 bg-white/10 backdrop-blur-md py-6 px-6 rounded-xl border border-white/10 shadow-lg">
          <div className="text-center">
            <div className="text-4xl font-bold">{paper.noOfCitations}</div>
            <div className="text-lg text-neutral-300">Citations</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">High</div>
            <div className="text-lg text-neutral-300">Impact</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 font-bungee">
          <button className="flex items-center gap-2 bg-[var(--color-orange)] text-white px-5 py-3 rounded-xl shadow-lg hover:scale-105 transition">
            <Download size={18} /> Download PDF
          </button>
          <button className="flex items-center gap-2 bg-white/15 text-white px-5 py-3 rounded-xl hover:bg-white/25 transition">
            <ExternalLink size={18} /> View on Publisher
          </button>
          <button className="flex items-center gap-2 bg-white/15 text-white px-5 py-3 rounded-xl hover:bg-white/25 transition">
            <Quote size={18} /> Cite
          </button>
        </div>

        {/* Menu Options */}
        <div className="mt-10 flex gap-1 border-b border-neutral-700">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => setSelectedTab(option)}
              className={`px-4 py-2 text-lg transition ${
                selectedTab === option
                  ? "border-b-4 border-[var(--color-orange)] text-[var(--color-orange)] font-semibold"
                  : "hover:text-[var(--color-orange)]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Dynamic Tab Content */}
        <div className="mt-10">{renderTabContent()}</div>
      </div>
    </div>
  );
}
