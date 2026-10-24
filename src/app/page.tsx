import Link from 'next/link';
import InteractiveHero from '@/features/visuals/components/InteractiveHero';
import AboutSection from '@/features/profile/components/AboutSection';
import ExperienceSection from '@/features/profile/components/ExperienceSection';
import ContactSection from '@/features/profile/components/ContactSection';
import { profile } from '@/features/profile/data/profile';

export default function Home() {
  return (
    <main className="relative min-h-screen selection:bg-accent/30">
      {/* High-performance, code-split 3D Hero section */}
      <InteractiveHero eyebrow={profile.role} title={profile.name} subtitle={profile.headline} />

      <AboutSection bio={profile.bio} skills={profile.skills} />

      <ExperienceSection experience={profile.experience} />

      <section className="mx-auto max-w-4xl px-6 py-24 text-center relative z-10">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Selected work</h2>
        <p className="mt-4 text-slate-400">Case studies from client and personal projects.</p>
        <Link
          href="/projects"
          className="mt-8 inline-block rounded-full border border-white/10 px-6 py-2 text-sm text-white transition hover:border-blue-500/40 hover:text-blue-300"
        >
          View projects →
        </Link>
      </section>

      <ContactSection email={profile.email} links={profile.links} />
    </main>
  );
}
