'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Code-split the heavy ThreeJS bundle so it does not degrade initial Core Web Vitals
const StarfieldCanvas = dynamic(() => import('./StarfieldCanvas'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-slate-950" />,
});

export default function InteractiveHero() {
  return (
    <section className="relative isolate flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden px-4">
      <StarfieldCanvas />

      <div className="relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl"
        >
          Engineering Meets Performance
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mx-auto mt-4 max-w-xl text-lg text-slate-400"
        >
          An enterprise-ready portfolio sandbox demonstrating smooth browser rendering and
          architecture boundaries.
        </motion.p>
      </div>
    </section>
  );
}
