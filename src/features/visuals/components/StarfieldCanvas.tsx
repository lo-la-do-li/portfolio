'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, type PointsBuffersProps } from '@react-three/drei';
import * as random from 'maath/random';

function StarfieldParticles(props: Omit<Partial<PointsBuffersProps>, 'ref'>) {
  const ref = useRef<React.ComponentRef<typeof Points>>(null);

  // 6000 items / stride 3 (X,Y,Z positions) = 2000 points
  const [sphere] = useState(
    () => random.inSphere(new Float32Array(6000), { radius: 1.2 }) as Float32Array
  );

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#3b82f6"
          size={0.015}
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

  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-slate-950">
      <Canvas key={canvasKey} camera={{ position: [0, 0, 1] }}>
        <StarfieldParticles />
      </Canvas>
    </div>
  );
}
