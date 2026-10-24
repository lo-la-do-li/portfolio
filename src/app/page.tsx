import InteractiveHero from '@/features/visuals/components/InteractiveHero';
import AboutSection from '@/features/profile/components/AboutSection';
import ExperienceSection from '@/features/profile/components/ExperienceSection';
import ContactSection from '@/features/profile/components/ContactSection';
import SelectedWorkSection from '@/features/projects/components/SelectedWorkSection';
import { profile } from '@/features/profile/data/profile';

export default function Home() {
  return (
    <main className="relative min-h-screen selection:bg-accent/30">
      {/* High-performance, code-split 3D Hero section */}
      <InteractiveHero eyebrow={profile.role} title={profile.name} subtitle={profile.headline} />

      <AboutSection bio={profile.bio} skills={profile.skills} />

      <ExperienceSection experience={profile.experience} />

      <SelectedWorkSection />

      <ContactSection email={profile.email} links={profile.links} />
    </main>
  );
}
