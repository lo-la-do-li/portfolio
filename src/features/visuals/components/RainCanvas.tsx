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

// Doubled with the fall range below, so on-screen density is unchanged
const DROP_COUNT = 12000;
const ACCENT_SHARE = 0.1;

// Camera and scene layout (world units)
const CAMERA_Z = 5;
const FOV = 50;
const MAX_ASPECT = 2.6; // widest hero we cover; wider screens just see the edges
// y: bottom, top. Extends far below the screen so each drop's runoff and drip
// can finish before it wraps back to the top.
const FALL_RANGE = [-18, 6];

// The invisible dome: center of its rim, and its radius/height. Fixed for now;
// later it rests over the name and follows the pointer.
const DOME = { center: [0, 0.6, 0], radius: 1.0, height: 0.6 };
// Draw the dome as a wireframe to check splashes line up with it
const DEBUG_DOME = false;

// Most rain falls in a thin slab through the dome's center so its shelter
// reads on screen. The footprint is a circle seen from the side: a drop in
// front of or behind it, but off to the side, misses the dome yet still crosses
// the dry column on screen. A thin slab means nearly every drop within the
// dome's width actually hits it. The rest is faint, distant rain for depth.
const NEAR_SHARE = 0.75;
const NEAR_DEPTH = 0.35 * DOME.radius; // near rain: z within ± this
const FAR_DEPTH = [-7, -2];

// Half the visible width at depth z, so each drop's x covers the screen there
function halfWidthAt(z: number) {
  return (CAMERA_Z - z) * Math.tan(((FOV / 2) * Math.PI) / 180) * MAX_ASPECT + 0.5;
}

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
    const z =
      Math.random() < NEAR_SHARE
        ? (Math.random() * 2 - 1) * NEAR_DEPTH
        : FAR_DEPTH[0] + Math.random() * (FAR_DEPTH[1] - FAR_DEPTH[0]);
    seeds[i * 4] = (Math.random() * 2 - 1) * halfWidthAt(z); // world x
    seeds[i * 4 + 1] = z; //                                  world z (depth)
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
      uFallRange: { value: FALL_RANGE },
      uDome: { value: DOME.center },
      uDomeSize: { value: [DOME.radius, DOME.height] },
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
    <>
      <mesh geometry={geometry} frustumCulled={false}>
        <shaderMaterial ref={materialRef} args={[materialParameters]} />
      </mesh>
      {DEBUG_DOME && (
        // Upper hemisphere scaled into the dome's ellipsoid
        <mesh
          position={DOME.center as [number, number, number]}
          scale={[DOME.radius, DOME.height, DOME.radius]}
        >
          <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial wireframe color={rainColors[theme].accent} />
        </mesh>
      )}
    </>
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
        camera={{ position: [0, 0, CAMERA_Z], fov: FOV }}
      >
        <RainField theme={theme} />
      </Canvas>
    </div>
  );
}
