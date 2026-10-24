'use client';

import dynamic from 'next/dynamic';
import { MotionConfig, motion } from 'framer-motion';

// Code-split the heavy ThreeJS bundle so it does not degrade initial Core Web Vitals.
// Each visual is its own chunk; only the one rendered below is downloaded.
const canvasPlaceholder = () => <div className="absolute inset-0 bg-bg" />;
const StarfieldCanvas = dynamic(() => import('./StarfieldCanvas'), {
  ssr: false,
  loading: canvasPlaceholder,
});
const RainCanvas = dynamic(() => import('./RainCanvas'), {
  ssr: false,
  loading: canvasPlaceholder,
});

// Which hero visual to show while the rain is in development. Flip to compare.
const HERO_VISUAL: 'rain' | 'starfield' = 'rain';

// Copy comes in as props so the visuals feature stays decoupled from profile data.
export default function InteractiveHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    // reducedMotion="user": with the OS setting on, Framer skips the slide-up
    // (transform) and keeps only the fade.
    <MotionConfig reducedMotion="user">
      <section className="px-4 pt-6 sm:px-6">
        {/* Double-rule poster frame: thick outer rule, gap, thin inner rule */}
        <div className="mx-auto max-w-6xl border-[3px] border-rule p-1.5">
          {/* Text sits bottom-left, leaving the starfield open above and to the right */}
          <div className="relative isolate flex min-h-[70vh] flex-col items-start justify-end overflow-hidden border border-rule px-6 pb-10 sm:px-12 sm:pb-14">
            {HERO_VISUAL === 'rain' ? <RainCanvas /> : <StarfieldCanvas />}

            <div className="relative z-10 max-w-2xl text-left">
              {/* Scrim: 80% background at the center, so particles fade behind the text without vanishing */}
              <div
                aria-hidden="true"
                className="absolute -inset-x-16 -top-12 -bottom-10 -z-10 bg-[radial-gradient(farthest-side_at_40%_58%,color-mix(in_srgb,var(--bg)_80%,transparent)_55%,transparent)]"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                // Thin outline in the background color keeps the small label legible over particles
                className="font-mono text-[15px] font-semibold uppercase tracking-[0.18em] text-fg [text-shadow:0_0_2px_var(--bg),0_0_4px_var(--bg),0_0_8px_var(--bg)] sm:text-base"
              >
                {eyebrow}
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8, ease: 'easeOut' }}
                className="mt-3 font-display text-4xl font-medium uppercase tracking-[0.08em] text-balance text-fg sm:text-6xl"
              >
                {title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.8 }}
                className="mt-5 max-w-xl text-lg text-fg [text-shadow:0_0_2px_var(--bg),0_0_6px_var(--bg)]"
              >
                {subtitle}
              </motion.p>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
