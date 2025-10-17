import TopSection from "../components/HomePage/TopSection"
import MidSection from "../components/HomePage/MidSection"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-[var(--color-gray)] text-[var(--color-gray)]">
      <TopSection />
      <MidSection />
    </div>
  );
}
