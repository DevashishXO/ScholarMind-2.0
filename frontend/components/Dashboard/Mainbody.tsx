export default function Mainbody() {
  return (
    <main className="flex-1 p-8 text-[var(--color-light)] overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bungee font-bold text-[var(--color-orange)]">Dashboard</h1>
        <p className="text-gray-300 mt-2">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-neutral-800 p-6 rounded-xl shadow-lg hover:shadow-orange-500/20 transition">
          <h2 className="text-lg font-semibold">Total Researches</h2>
          <p className="text-3xl font-bold text-[var(--color-orange)] mt-2">17</p>
        </div>

        <div className="bg-neutral-800 p-6 rounded-xl shadow-lg hover:shadow-orange-500/20 transition">
          <h2 className="text-lg font-semibold">Active Chats</h2>
          <p className="text-3xl font-bold text-[var(--color-orange)] mt-2">5</p>
        </div>

        <div className="bg-neutral-800 p-6 rounded-xl shadow-lg hover:shadow-orange-500/20 transition">
          <h2 className="text-lg font-semibold">Saved Collections</h2>
          <p className="text-3xl font-bold text-[var(--color-orange)] mt-2">8</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-10 bg-neutral-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--color-orange)]">Recent Activity</h2>
        <ul className="space-y-3">
          <li className="bg-neutral-900 p-3 rounded-lg hover:bg-neutral-700 transition">
            Completed research on <span className="text-[var(--color-orange)]">AI in Education</span>
          </li>
          <li className="bg-neutral-900 p-3 rounded-lg hover:bg-neutral-700 transition">
            New chat started with <span className="text-[var(--color-orange)]">Research Bot</span>
          </li>
          <li className="bg-neutral-900 p-3 rounded-lg hover:bg-neutral-700 transition">
            Added a paper to <span className="text-[var(--color-orange)]">Machine Learning Collection</span>
          </li>
        </ul>
      </div>
    </main>
  );
}
