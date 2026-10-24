'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random';
import { Color } from 'three';
import type { Theme } from '@/features/theme/constants';
import { useTheme } from '@/features/theme/useTheme';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { particleColors } from '../palette';

const POINT_COUNT = 2000;

// One RGB triple per point, cycling through the theme's palette. Color.set()
// converts the sRGB hex into three.js's linear working space, which is what
// vertex colors expect.
function buildColors(palette: readonly string[]): Float32Array {
  const colors = new Float32Array(POINT_COUNT * 3);
  const color = new Color();
  for (let i = 0; i < POINT_COUNT; i++) {
    color.set(palette[i % palette.length]).toArray(colors, i * 3);
  }
  return colors;
}

function StarfieldParticles({ theme }: { theme: Theme }) {
  const ref = useRef<React.ComponentRef<typeof Points>>(null);

  // POINT_COUNT points × stride 3 (X,Y,Z positions)
  const [sphere] = useState(
    () => random.inSphere(new Float32Array(POINT_COUNT * 3), { radius: 1.2 }) as Float32Array
  );
  // Built once per theme; switching themes just picks the other array.
  const [colorsByTheme] = useState(() => ({
    dark: buildColors(particleColors.dark),
    light: buildColors(particleColors.light),
  }));

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      {/* key: a new color buffer needs a fresh geometry attribute */}
      <Points
        key={theme}
        ref={ref}
        positions={sphere}
        colors={colorsByTheme[theme]}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          vertexColors
          // Slightly larger on paper, where small light points wash out.
          size={theme === 'light' ? 0.02 : 0.015}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

export default function StarfieldCanvas() {
  // With cacheComponents, Next hides (not unmounts) this page on navigation via
  // <Activity>. R3F's cleanup destroys the WebGL context but keeps its root ref,
  // so on return it re-renders into a dead context. Bumping the key on hide
  // makes React mount a fresh <Canvas> when the page is shown again.
  const [canvasKey, setCanvasKey] = useState(0);
  useLayoutEffect(() => () => setCanvasKey((key) => key + 1), []);

  const theme = useTheme();
  const reducedMotion = usePrefersReducedMotion();

  // Stop rendering frames while the hero is scrolled out of view.
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // 'demand' renders a still frame and then only when something changes
  // (e.g. the theme), instead of 60 frames a second.
  const frameloop = inView && !reducedMotion ? 'always' : 'demand';

  return (
    <div ref={containerRef} className="absolute inset-0 -z-10 h-full w-full bg-bg">
      <Canvas key={canvasKey} frameloop={frameloop} camera={{ position: [0, 0, 1] }}>
        <StarfieldParticles theme={theme} />
      </Canvas>
    </div>
  );
}
