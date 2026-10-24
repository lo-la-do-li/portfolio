'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  PlaneGeometry,
  ShaderMaterial,
} from 'three';
import type { Theme } from '@/features/theme/constants';
import { useTheme } from '@/features/theme/useTheme';
import { useCanvasLifecycle } from '../hooks/useCanvasLifecycle';
import { rainColors } from '../palette';
import { rainFragmentShader, rainVertexShader } from '../shaders/rain';

const DROP_COUNT = 6000;
const ACCENT_SHARE = 0.1;

function buildGeometry() {
  // One 1×1 quad, drawn DROP_COUNT times in a single draw call (instancing).
  const quad = new PlaneGeometry(1, 1);
  const geometry = new InstancedBufferGeometry();
  geometry.index = quad.index;
  geometry.setAttribute('position', quad.getAttribute('position'));
  geometry.instanceCount = DROP_COUNT;

  // Per-drop random values, generated once. The shader turns these + time into
  // a position, so nothing here changes after this point.
  const seeds = new Float32Array(DROP_COUNT * 4);
  const accents = new Float32Array(DROP_COUNT);
  for (let i = 0; i < DROP_COUNT; i++) {
    seeds[i * 4] = Math.random(); //       x position
    seeds[i * 4 + 1] = Math.random(); //   z position (depth)
    seeds[i * 4 + 2] = Math.random(); //   fall phase
    seeds[i * 4 + 3] = 0.85 + Math.random() * 0.3; // speed factor
    accents[i] = Math.random() < ACCENT_SHARE ? 1 : 0;
  }
  geometry.setAttribute('aSeed', new InstancedBufferAttribute(seeds, 4));
  geometry.setAttribute('aAccent', new InstancedBufferAttribute(accents, 1));
  return geometry;
}

// Built once per mount: shader source, uniforms and blending. R3F constructs
// the ShaderMaterial from this and disposes it on unmount.
function createMaterialParameters() {
  return {
    vertexShader: rainVertexShader,
    fragmentShader: rainFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uBoxX: { value: [-11, 11] },
      uBoxY: { value: [-5.5, 5.5] },
      uBoxZ: { value: [-7, 2.5] },
      uColor: { value: new Color() },
      uAccent: { value: new Color() },
      uOpacity: { value: 0.5 },
    },
    transparent: true,
    depthWrite: false,
  };
}

function RainField({ theme }: { theme: Theme }) {
  const invalidate = useThree((state) => state.invalidate);
  // Lazy initializers run once; the values never change identity afterwards.
  const [geometry] = useState(buildGeometry);
  const [materialParameters] = useState(createMaterialParameters);
  // Uniforms change outside React's render cycle (every frame), so they're
  // updated through a ref rather than state.
  const materialRef = useRef<ShaderMaterial>(null);

  // Theme → uniforms. No rebuild: the GPU just gets three new values.
  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    const colors = rainColors[theme];
    material.uniforms.uColor.value.set(colors.main);
    material.uniforms.uAccent.value.set(colors.accent);
    material.uniforms.uOpacity.value = theme === 'dark' ? 0.55 : 0.45;
    invalidate(); // redraw even when paused ('demand' frameloop)
  }, [theme, invalidate]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  // The only per-frame CPU work: advance time. Pausing the frameloop freezes it.
  useFrame((_, delta) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value += delta;
  });

  // frustumCulled off: three would cull using the 1×1 quad's bounds, but the
  // shader moves every instance far from the origin.
  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial ref={materialRef} args={[materialParameters]} />
    </mesh>
  );
}

export default function RainCanvas() {
  const { canvasKey, containerRef, frameloop } = useCanvasLifecycle();
  const theme = useTheme();

  return (
    <div ref={containerRef} className="absolute inset-0 -z-10 h-full w-full bg-bg">
      <Canvas
        key={canvasKey}
        frameloop={frameloop}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 50 }}
      >
        <RainField theme={theme} />
      </Canvas>
    </div>
  );
}
