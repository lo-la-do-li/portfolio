import Link from 'next/link';
import InteractiveHero from '@/features/visuals/components/InteractiveHero';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* High-performance, code-split 3D Hero section */}
      <InteractiveHero />

      <section className="mx-auto max-w-4xl px-6 py-24 text-center relative z-10">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Selected work</h2>
        <p className="mt-4 text-slate-400">
          A feature-driven Next.js layout sandbox demonstrating enterprise-grade architecture and
          tooling.
        </p>
        <Link
          href="/projects"
          className="mt-8 inline-block rounded-full border border-white/10 px-6 py-2 text-sm text-white transition hover:border-blue-500/40 hover:text-blue-300"
        >
          View projects →
        </Link>
      </section>
    </main>
  );
}
