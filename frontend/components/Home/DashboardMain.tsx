import React from "react";
import {
  BookOpen,
  BarChart2,
  PieChart,
  Clock,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";


const papersByTopic = [
  { name: "NLP", value: 28 },
  { name: "CV", value: 20 },
  { name: "Robotics", value: 12 },
  { name: "ML Theory", value: 16 },
  { name: "Systems", value: 8 },
];

const COLORS = ["#fb923c", "#f97316", "#fb7185", "#60a5fa", "#a78bfa"];


function TopicDonutChart() {
  return (
    <div className="h-70 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie
            data={papersByTopic}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={92}
            paddingAngle={4}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {papersByTopic.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ color: "var(--color-light)" }} />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
};
function StatCard({ title, value, icon, subtitle }: StatCardProps) {
  return (
    <div className=" bg-neutral-800 border border-white/6 backdrop-blur-md rounded-2xl p-5 shadow-sm hover:shadow-orange-500/10 transition">
      <div className="flex flex-col items-center justify-between gap-4">
      <div className="flex gap-4 items-center">
        <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-white/4">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-300">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
      </div>
        
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function DashboardMain() {
  return (<>
    {/* Stats + Charts grid */}
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Extra full-width insights (glass) */}
      <div className="bg-neutral-800 col-span-2 border border-white/6 backdrop-blur-md rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[var(--color-orange)] mb-3">Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--color-gray)] rounded-lg">
            <p className="text-sm text-gray-300">Avg. response time</p>
            <p className="text-2xl font-bold text-white mt-2">1.6s</p>
          </div>
          <div className="p-4  bg-[var(--color-gray)] rounded-lg">
            <p className="text-sm text-gray-300">Papers reviewed / week</p>
            <p className="text-2xl font-bold text-white mt-2">4.8</p>
          </div>
          <div className="p-4  bg-[var(--color-gray)] rounded-lg">
            <p className="text-sm text-gray-300">Satisfaction</p>
            <p className="text-2xl font-bold text-white mt-2">92%</p>
          </div>
        </div>
      </div>
      
      {/* Right column - charts (spans 2 columns on large screens) */}
      <div className="lg:col-span-2 space-y-6 ">
        {/* Glass card containing two charts in a row */}
        <div className="bg-neutral-800 border border-white/6 backdrop-blur-md rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--color-orange)]">Analytics</h3>
            <p className="text-sm text-gray-400">Overview of your recent research metrics</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 h-full">

            {/* Right: Donut Chart */}
            <div className="bg-neutral-800 p-4 rounded-xl flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <PieChart size={20} className="text-[var(--color-orange)]" />
                  <h4 className="font-semibold">Papers by Topic</h4>
                </div>
                <div className="text-xs text-gray-400">Distribution</div>
              </div>
              <TopicDonutChart />
            </div>
          </div>
        </div>
        
      {/* Left column - stats & recent */}
      <div className="lg:col-span-1 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Total Researches"
            value={17}
            subtitle="Since Jan 2025"
            icon={<BookOpen size={22} className="text-[var(--color-orange)]" />}
          />
          <StatCard
            title="Active Chats"
            value={5}
            subtitle="Realtime"
            icon={<BarChart2 size={22} className="text-[var(--color-orange)]" />}
          />
          <StatCard
            title="Collections"
            value={8}
            subtitle="Saved groups"
            icon={<Sparkles size={22} className="text-[var(--color-orange)]" />}
          />
          <StatCard
            title="Highlights"
            value={12}
            subtitle="Starred notes"
            icon={<PieChart size={22} className="text-[var(--color-orange)]" />}
          />
        </div>

        {/* Recent Activity (glass) */}
        <div className=" bg-neutral-800 border border-white/6 backdrop-blur-md p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--color-orange)]">Recent Activity</h3>
            <span className="text-xs text-gray-400">Today</span>
          </div>

          <ul className="space-y-3">
            <li className="flex items-start gap-3 bg-[rgba(255,255,255,0.02)] p-3 rounded-lg">
              <Clock size={18} className="text-gray-300 mt-1" />
              <div>
                <p className="text-sm">Completed research on <span className="text-[var(--color-orange)]">AI in Education</span></p>
                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
              </div>
            </li>

            <li className="flex items-start gap-3 bg-[rgba(255,255,255,0.02)] p-3 rounded-lg">
              <Clock size={18} className="text-gray-300 mt-1" />
              <div>
                <p className="text-sm">New chat started with <span className="text-[var(--color-orange)]">Research Bot</span></p>
                <p className="text-xs text-gray-400 mt-1">4 hours ago</p>
              </div>
            </li>

            <li className="flex items-start gap-3 bg-[rgba(255,255,255,0.02)] p-3 rounded-lg">
              <Clock size={18} className="text-gray-300 mt-1" />
              <div>
                <p className="text-sm">Added paper to <span className="text-[var(--color-orange)]">Machine Learning</span></p>
                <p className="text-xs text-gray-400 mt-1">Yesterday</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      


      </div>
    </section>
  </>)
}