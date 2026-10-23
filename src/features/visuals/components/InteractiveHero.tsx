'use client';

import dynamic from 'next/dynamic';
import { MotionConfig, motion } from 'framer-motion';

// Code-split the heavy ThreeJS bundle so it does not degrade initial Core Web Vitals
const StarfieldCanvas = dynamic(() => import('./StarfieldCanvas'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-bg" />,
});

// Copy comes in as props so the visuals feature stays decoupled from profile data.
export default function InteractiveHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    // reducedMotion="user": with the OS setting on, Framer skips the slide-up
    // (transform) and keeps only the fade.
    <MotionConfig reducedMotion="user">
      <section className="px-4 pt-6 sm:px-6">
        {/* Double-rule poster frame: thick outer rule, gap, thin inner rule */}
        <div className="mx-auto max-w-6xl border-[3px] border-rule p-1.5">
          <div className="relative isolate flex min-h-[70vh] flex-col items-center justify-center overflow-hidden border border-rule px-6">
            <StarfieldCanvas />

            <div className="relative z-10 text-center">
              {/* Scrim: fades particles out behind the text so it stays legible */}
              <div
                aria-hidden="true"
                className="absolute -inset-x-16 -inset-y-14 -z-10 bg-[radial-gradient(closest-side,var(--bg)_45%,transparent)]"
              />
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="font-display text-4xl font-medium uppercase tracking-[0.08em] text-balance text-fg sm:text-6xl"
              >
                {title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="mx-auto mt-5 max-w-xl text-lg text-fg"
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
