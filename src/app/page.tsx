import InteractiveHero from '@/features/visuals/components/InteractiveHero';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* High-performance, code-split 3D Hero section */}
      <InteractiveHero />
    </main>
  );
}
