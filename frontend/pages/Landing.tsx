import TopSection from "../components/Landing/TopSection"
import MidSection from "../components/Landing/MidSection"

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-neutral-900 text-[var(--color-gray)]">
      <TopSection />
      <MidSection />
    </div>
  );
}
