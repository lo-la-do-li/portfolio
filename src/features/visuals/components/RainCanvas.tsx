'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
  type Camera,
  type Mesh,
} from 'three';
import type { Theme } from '@/features/theme/constants';
import { useTheme } from '@/features/theme/useTheme';
import { useCanvasLifecycle } from '../hooks/useCanvasLifecycle';
import { rainColors } from '../palette';
import { rainFragmentShader, rainVertexShader } from '../shaders/rain';

// --- Motion safety -------------------------------------------------------
// Fast, dense, multi-depth rain caused motion sickness, so this is a gentle
// rain: slow, sparse, faint, and a single depth layer. It plays continuously,
// with a Pause/Play button (WCAG 2.2.2: auto-playing motion must be pausable).
// Pausing fades the rain out rather than freezing it (a frozen frame of rain
// in the dark looked eerie); with prefers-reduced-motion it only plays if the
// visitor presses Play.
const FADE_SECONDS = 0.6; // fading in or out on Play/Pause and load

// --- Scene (world units) -------------------------------------------------
const CAMERA_Z = 5;
const FOV = 50;
const DROP_COUNT = 2800; // ~600 on screen at once: most of each loop is off screen
const ACCENT_SHARE = 0.1;
// Share of drops that always fall over the dome, wherever it is: rain landing
// on it (splashes, runoff, drips) is what draws its shape
const OVER_DOME_SHARE = 0.25;
// Each drop's loop: the visible shower is a small part of it; the rest is
// off screen so runoff and drips can finish before the drop falls again.
const FALL_SPAN = 24;

// The invisible dome: center of its rim (starting point; it then rests over
// the name and follows the pointer), and its radius/height.
const DOME = { center: [0, 0.6, 0], radius: 1.0, height: 0.6 };
// The rain across the hero: half width, top, bottom (covers the widest hero)
const RAIN = [6.5, 2.7, -2.7];
// Rain in a thin slab through the dome's center, so its shelter reads on
// screen (a drop in front of the dome but off to the side would still cross
// the dry space on screen)
const SLAB_DEPTH = 0.35 * DOME.radius;
// Resting: rim this far above the top of the name
const REST_GAP = 0.15;
// Following: the pointer is the hand on an invisible handle, this far below the rim
const HANDLE_LENGTH = 0.55;
// How quickly the dome catches up with its target (higher = snappier)
const FOLLOW_RATE = 6;
// Draw the dome as a wireframe to check splashes line up with it
const DEBUG_DOME = false;

// Screen point (pixels within the canvas) → world point on the dome's depth
// plane (z = 0): cast a ray from the camera through the pixel, see where it
// crosses that plane.
const rayTarget = new Vector3();
function screenToWorld(x: number, y: number, rect: DOMRect, camera: Camera, out: Vector3) {
  rayTarget.set((x / rect.width) * 2 - 1, -(y / rect.height) * 2 + 1, 0.5).unproject(camera);
  const direction = rayTarget.sub(camera.position).normalize();
  const distance = -camera.position.z / direction.z;
  return out.copy(camera.position).addScaledVector(direction, distance);
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
    // x: −1–1 across the hero, or (offset from the dome) + 10 for drops that
    // always fall over the umbrella — the shader tells them apart by size
    const x = Math.random() * 2 - 1;
    seeds[i * 4] = Math.random() < OVER_DOME_SHARE ? x + 10 : x;
    seeds[i * 4 + 1] = (Math.random() * 2 - 1) * SLAB_DEPTH; // world z (depth)
    seeds[i * 4 + 2] = Math.random(); //                         fall phase
    seeds[i * 4 + 3] = 0.85 + Math.random() * 0.3; //            speed factor
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
      uFallSpan: { value: FALL_SPAN },
      uRain: { value: RAIN },
      uDome: { value: new Vector3(...DOME.center) },
      uDomeSize: { value: [DOME.radius, DOME.height] },
      uColor: { value: new Color() },
      uAccent: { value: new Color() },
      uOpacity: { value: 0.5 },
      uVisibility: { value: 0 }, // fades in on start
    },
    transparent: true,
    depthWrite: false,
  };
}

type HeroRefs = {
  /** The name heading: the umbrella rests just above it */
  anchorRef: RefObject<HTMLElement | null>;
  /** Element whose pointer movement carries the umbrella (the hero frame) */
  interactionRef: RefObject<HTMLElement | null>;
};

type RainFieldProps = HeroRefs & {
  theme: Theme;
  /** Fade the shower in (true) or out (false) */
  playing: boolean;
  /** Fully faded out: rendering can stop */
  onHidden: () => void;
};

function RainField({ theme, anchorRef, interactionRef, playing, onHidden }: RainFieldProps) {
  const invalidate = useThree((state) => state.invalidate);
  const camera = useThree((state) => state.camera);
  const canvas = useThree((state) => state.gl.domElement);
  const size = useThree((state) => state.size);
  // Lazy initializers run once; the values never change identity afterwards.
  const [geometry] = useState(buildGeometry);
  const [materialParameters] = useState(createMaterialParameters);
  // Values that change outside React's render cycle live in refs.
  const materialRef = useRef<ShaderMaterial>(null);
  const debugDomeRef = useRef<Mesh>(null);
  const rest = useRef(new Vector3(...DOME.center)); // above the name
  const pointer = useRef<Vector3 | null>(null); //    null: not hovering
  const dome = useRef(new Vector3(...DOME.center)); // current, eased position
  const placed = useRef(false);
  const hidden = useRef(true); // fully faded out (and onHidden already called)

  // Theme → uniforms. No rebuild: the GPU just gets three new values.
  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    const colors = rainColors[theme];
    material.uniforms.uColor.value.set(colors.main);
    material.uniforms.uAccent.value.set(colors.accent);
    material.uniforms.uOpacity.value = theme === 'dark' ? 0.38 : 0.32; // light rain
    invalidate(); // redraw even when paused ('demand' frameloop)
  }, [theme, invalidate]);

  // Resting position: just above the name, centered on it. Re-measured when
  // the canvas resizes (size) or the heading does (e.g. the web font loads).
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    function measure() {
      if (!anchor) return;
      const canvasRect = canvas.getBoundingClientRect();
      const nameRect = anchor.getBoundingClientRect();
      screenToWorld(
        nameRect.left - canvasRect.left + nameRect.width / 2,
        nameRect.top - canvasRect.top,
        canvasRect,
        camera,
        rest.current
      );
      rest.current.y += REST_GAP;
      if (!placed.current) {
        // First placement: start at rest (no easing in from the middle), and
        // update the GPU now in case frames are paused (reduced motion)
        dome.current.copy(rest.current);
        materialRef.current?.uniforms.uDome.value.copy(dome.current);
        placed.current = true;
      }
      invalidate();
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(anchor);
    // The heading slides up on load (a transform, which doesn't trigger a
    // resize), so measure again once that entrance has finished
    const afterEntrance = window.setTimeout(measure, 1000);
    return () => {
      observer.disconnect();
      window.clearTimeout(afterEntrance);
    };
  }, [anchorRef, canvas, camera, size, invalidate]);

  // Pointer: mouse only, so touch keeps scrolling the page
  useEffect(() => {
    const element = interactionRef.current;
    if (!element) return;
    function onMove(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return;
      const canvasRect = canvas.getBoundingClientRect();
      const target = pointer.current ?? new Vector3();
      screenToWorld(
        event.clientX - canvasRect.left,
        event.clientY - canvasRect.top,
        canvasRect,
        camera,
        target
      );
      target.y += HANDLE_LENGTH;
      pointer.current = target;
    }
    function onLeave() {
      pointer.current = null;
    }
    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerleave', onLeave);
    return () => {
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
    };
  }, [interactionRef, canvas, camera]);

  useEffect(() => {
    if (playing) hidden.current = false;
  }, [playing]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  // Per-frame CPU work: fade toward the target visibility, advance time (the
  // rain slows as it fades), and ease the dome toward its target. Every drop
  // is computed from these values on the GPU.
  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material || hidden.current) return;

    const uniforms = material.uniforms;
    const step = delta / FADE_SECONDS;
    uniforms.uVisibility.value = playing
      ? Math.min(1, uniforms.uVisibility.value + step)
      : Math.max(0, uniforms.uVisibility.value - step);
    uniforms.uTime.value += delta * uniforms.uVisibility.value;

    // Frame-rate independent easing: same feel at 60Hz and 120Hz
    const target = pointer.current ?? rest.current;
    dome.current.lerp(target, 1 - Math.exp(-FOLLOW_RATE * delta));
    uniforms.uDome.value.copy(dome.current);
    debugDomeRef.current?.position.copy(dome.current);

    // Faded out: stop drawing frames until Play
    if (!playing && uniforms.uVisibility.value === 0) {
      hidden.current = true;
      onHidden();
    }
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
        <mesh ref={debugDomeRef} scale={[DOME.radius, DOME.height, DOME.radius]}>
          <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial wireframe color={rainColors[theme].accent} />
        </mesh>
      )}
    </>
  );
}

export default function RainCanvas({ anchorRef, interactionRef }: HeroRefs) {
  const { canvasKey, containerRef, reducedMotion, inView } = useCanvasLifecycle();
  const theme = useTheme();
  const [userPaused, setUserPaused] = useState(false);
  const [userPlayed, setUserPlayed] = useState(false); // pressed Play at least once
  const [faded, setFaded] = useState(true); // fully faded out: no frames needed

  // Plays unless paused; with reduced motion, only after the visitor presses Play
  const playing = !userPaused && (!reducedMotion || userPlayed);
  // Keep drawing while playing or still fading out, and only while on screen
  const drawing = inView && (playing || !faded);

  // Stable callback, so it doesn't change on every render
  const handleHidden = useCallback(() => setFaded(true), []);

  function togglePlay() {
    if (playing) {
      setUserPaused(true);
    } else {
      setUserPaused(false);
      setUserPlayed(true);
    }
    setFaded(false);
  }

  return (
    <div ref={containerRef} className="absolute inset-0 -z-10 h-full w-full bg-bg">
      <Canvas
        key={canvasKey}
        frameloop={drawing ? 'always' : 'demand'}
        dpr={[1, 2]}
        camera={{ position: [0, 0, CAMERA_Z], fov: FOV }}
      >
        <RainField
          theme={theme}
          anchorRef={anchorRef}
          interactionRef={interactionRef}
          playing={playing}
          onHidden={handleHidden}
        />
      </Canvas>

      {/* WCAG 2.2.2: motion that starts automatically must be pausable */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? 'Pause rain animation' : 'Play rain animation'}
        className="absolute right-3 top-3 border border-rule-soft bg-bg/80 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-colors hover:border-rule hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {playing ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}
