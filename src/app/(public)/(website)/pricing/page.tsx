import { PlansSection } from "../_components/plans-section";

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06090D] pt-32 text-arena-text">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-24 left-[12%] h-80 w-80 rounded-full bg-arena-info/10 blur-[120px]" />
        <div className="absolute right-[10%] bottom-24 h-96 w-96 rounded-full bg-arena-primary/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,255,79,0.06),transparent_42%)]" />
      </div>

      <PlansSection standalone />
    </main>
  );
}
