export default function ChatWithPaper() {
  return (
    <div className="max-w-[80%] w-full mx-auto py-10 px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white">Chat with Paper</h1>
        <p className="text-neutral-400 mt-2">
          Interact with your research papers using AI — ask questions, summarize, and explore insights.
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        
        {/* Chatbot Panel */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg flex flex-col h-[80vh]">
          <div className="border-b border-neutral-700 px-5 py-3 flex justify-between items-center">
            <div className="flex gap-2 items-center"> 
            <img src="/icons8-bot-64.png" alt="Logo" className="w-10 h-10 rounded-full bg-[var(--color-orange)] p-1" />
            <h2 className="text-lg font-medium text-white font-bungee">Research Assistant</h2>
            </div>
            <span className="text-sm text-neutral-400">Ask anything</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 text-neutral-300">
            {/* Chat messages go here */}
            <p className="text-sm text-neutral-500">Start a conversation by asking about this paper.</p>
          </div>

          <div className="border-t border-neutral-700 px-5 py-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 bg-neutral-700 text-white rounded-lg px-4 py-2 outline-none focus:ring focus:ring-orange-500/70"
              />
              <button className="bg-[var(--color-orange)] hover:bg-orange-500/70 transition px-4 py-2 rounded-lg text-white cursor-pointer">
                Send
              </button>
            </div>
          </div>
        </div>

        {/* PDF Viewer Panel */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg flex flex-col h-[80vh]">
          <div className="border-b border-neutral-700 px-5 py-3">
            <h2 className="text-lg font-medium text-white font-bungee">Paper Viewer</h2>
          </div>
          <div className="flex-1 overflow-y-auto flex items-center justify-center text-neutral-400">
            {/* Replace with PDF viewer */}
            <p>Upload or select a paper to view here.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
