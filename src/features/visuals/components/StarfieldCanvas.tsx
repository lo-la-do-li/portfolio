'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as random from 'maath/random';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  MathUtils,
  Points,
  ShaderMaterial,
  Vector2,
} from 'three';
import type { Theme } from '@/features/theme/constants';
import { useTheme } from '@/features/theme/useTheme';
import { useHeroPointer, type HeroPointer } from '../hooks/useHeroPointer';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { fragmentShader, vertexShader } from '../lensShader';
import { lensHighlight, particleColors } from '../palette';

const POINT_COUNT = 2000;
const POINT_SIZE = 0.015;
// Lens size in half-heights of the hero, and how much it magnifies at its center
const LENS_RADIUS = 0.4;
const LENS_MAGNIFY = 0.8;

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

function StarfieldParticles({
  theme,
  pointer,
}: {
  theme: Theme;
  pointer: React.RefObject<HeroPointer>;
}) {
  const ref = useRef<Points>(null);

  // POINT_COUNT points × stride 3 (X,Y,Z positions)
  const [sphere] = useState(
    () => random.inSphere(new Float32Array(POINT_COUNT * 3), { radius: 1.2 }) as Float32Array
  );
  // Built once per theme; switching themes just picks the other array.
  const [colorsByTheme] = useState(() => ({
    dark: buildColors(particleColors.dark),
    light: buildColors(particleColors.light),
  }));

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(sphere, 3));
    geo.setAttribute('aColor', new BufferAttribute(colorsByTheme[theme], 3));
    return geo;
  }, [sphere, colorsByTheme, theme]);

  const materialRef = useRef<ShaderMaterial>(null);
  const shaderArgs = useMemo(
    () => ({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uPointer: { value: new Vector2() },
        uStrength: { value: 0 },
        uAspect: { value: 1 },
        uRadius: { value: LENS_RADIUS },
        uMagnify: { value: LENS_MAGNIFY },
        uSize: { value: POINT_SIZE },
        uScale: { value: 1 },
        uHighlight: { value: new Color(lensHighlight[theme]) },
      },
    }),
    [theme]
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ size, viewport }, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }

    const material = materialRef.current;
    if (!material) return;
    const u = material.uniforms;
    u.uAspect.value = size.width / size.height;
    // three's own PointsMaterial scales sizes by pixel ratio and canvas height
    u.uScale.value = size.height * 0.5;
    u.uSize.value = (theme === 'light' ? 0.02 : POINT_SIZE) * viewport.dpr;

    // Ease the lens in and out, and glide it after the cursor. When it's fully
    // faded, snap to the cursor so it doesn't sweep in from its last position.
    const p = pointer.current;
    u.uStrength.value = MathUtils.damp(u.uStrength.value, p.active ? 1 : 0, 6, delta);
    const lens: Vector2 = u.uPointer.value;
    if (p.active) {
      const snap = u.uStrength.value < 0.02;
      lens.x = snap ? p.x : MathUtils.damp(lens.x, p.x, 16, delta);
      lens.y = snap ? p.y : MathUtils.damp(lens.y, p.y, 16, delta);
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <points ref={ref} geometry={geometry} frustumCulled={false}>
        <shaderMaterial ref={materialRef} args={[shaderArgs]} />
      </points>
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

  // The cursor lens is skipped under reduced motion, which keeps the field still.
  const pointer = useRef<HeroPointer>({ x: 0, y: 0, active: false });
  useHeroPointer(containerRef, pointer, !reducedMotion);

  return (
    <div ref={containerRef} className="absolute inset-0 -z-10 h-full w-full bg-bg">
      <Canvas key={canvasKey} frameloop={frameloop} camera={{ position: [0, 0, 1] }}>
        <StarfieldParticles theme={theme} pointer={pointer} />
      </Canvas>
    </div>
  );
}
