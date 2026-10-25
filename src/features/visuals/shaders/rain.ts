// GLSL for the hero rain. Every drop is one instance of a tiny quad; its whole
// state — falling, hitting the invisible dome, splashing, running off the
// curve and dripping from the rim — is computed on the
// GPU from time and its per-drop seed. Nothing is stored between frames: the
// CPU only updates `uTime` (and later the dome's position).

export const rainVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uFallSpan;   // length of each drop's loop (mostly off screen)
  uniform vec3 uRain;        // half width, top, bottom (world units, whole hero)
  uniform vec3 uDome;        // center of the dome's rim (world units)
  uniform vec2 uDomeSize;    // radius, height

  attribute vec4 aSeed;      // x (see below), world z, fall phase (0–1), speed factor
  attribute float aAccent;   // 1.0 for accent-colored drops

  varying vec2 vUv;
  varying float vFade;       // depth fade: far drops are fainter
  varying float vAccent;
  varying float vMode;       // 0 streak, 1 splash ring
  varying float vAge;        // splash: 0 → 1 over its life
  varying float vStrength;   // extra opacity factor (runoff fades in)

  const float SPEED = 3.0;          // gentle: drifts rather than streaks
  const float LENGTH = 0.2;         // rain streak length
  const float WIDTH = 0.012;        // streak width
  const float SPLASH_TIME = 0.22;   // seconds
  const float SPLASH_SIZE = 0.09;   // final ring diameter
  const float RUNOFF_SHARE = 0.2;   // share of impacts that run off
  const float SLIDE_V0 = 0.3;       // runoff's starting speed down the surface
  const float SLIDE_ACCEL = 4.0;    // and its acceleration
  const float GRAVITY = 20.0;       // once it leaves the rim
  const float RUNOFF_LENGTH = 0.07; // rivulet streak length on the surface
  const float DRIP_LENGTH = 0.16;   // drips read as drops, not strands

  const float STREAK = 0.0;
  const float SPLASH = 1.0;

  // Point on the dome's surface at distance d from its axis, in direction dir
  vec3 surfacePoint(vec2 dir, float d) {
    float k = min(d / uDomeSize.x, 1.0);
    return vec3(
      uDome.x + dir.x * d,
      uDome.y + uDomeSize.y * sqrt(1.0 - k * k),
      uDome.z + dir.y * d
    );
  }

  // Downhill direction along the surface at distance d (the derivative of the
  // surface height). Steepens toward the rim, where it points straight down.
  vec3 downhill(vec2 dir, float d) {
    float k = min(d / uDomeSize.x, 0.999);
    float slope = uDomeSize.y * k / (uDomeSize.x * sqrt(1.0 - k * k));
    return normalize(vec3(dir.x, -slope, dir.y));
  }

  void main() {
    float speed = SPEED * aSeed.w;

    // Gentle rain across the hero. Most drops have a fixed x (aSeed.x in −1–1,
    // scaled to the hero's width). Drops marked to fall over the umbrella store
    // x + 10 instead, as an offset from the dome, so its outline always has
    // rain landing on it wherever it moves.
    float x = aSeed.x > 5.0
      ? uDome.x + (aSeed.x - 10.0) * uDomeSize.x
      : aSeed.x * uRain.x;
    // Falling forever: height wraps around the loop (mod works like a clock
    // face), offset by each drop's phase so they don't move in lockstep. The
    // loop extends well below the hero so runoff and drips can finish.
    float top = uRain.y;
    float fallen = mod(aSeed.z * uFallSpan + uTime * speed, uFallSpan);
    vec3 center = vec3(x, top - fallen, aSeed.y);

    float mode = STREAK;
    float age = 0.0;
    float strength = 1.0;
    float streakLength = LENGTH;
    vec3 streakAxis = vec3(0.0, 1.0, 0.0);   // falling rain: vertical
    bool water = false;                       // running off the dome
    bool hidden = false;

    // --- The invisible dome: top half of an ellipsoid ---
    vec2 offset = center.xz - uDome.xz;
    float d = length(offset);
    if (d < uDomeSize.x) {
      float k = d / uDomeSize.x;
      float surface = uDome.y + uDomeSize.y * sqrt(1.0 - k * k);
      float sinceImpact = (surface - center.y) / speed;   // < 0: still falling

      if (sinceImpact > 0.0) {
        if (sinceImpact < SPLASH_TIME) {
          // 1. Splash: a ring growing on the surface
          mode = SPLASH;
          age = sinceImpact / SPLASH_TIME;
          center.y = surface;
        } else if (fract(sin(aSeed.z * 1651.3 + aSeed.w * 89.7) * 43758.5453) < RUNOFF_SHARE) {
          water = true;
          float t = sinceImpact - SPLASH_TIME;
          // Direction away from the dome's axis (any direction if dead center)
          vec2 dir = d > 0.001 ? offset / d : vec2(1.0, 0.0);
          // Time to reach the rim: solve d + v0·t + ½a·t² = radius
          float slideTime = (-SLIDE_V0 + sqrt(SLIDE_V0 * SLIDE_V0
            + 2.0 * SLIDE_ACCEL * (uDomeSize.x - d))) / SLIDE_ACCEL;

          if (t < slideTime) {
            // 2. Rivulet: runs down the curve, speeding up, as a short streak
            // lined up with its motion (reads as flowing water, not a dot)
            float dd = d + SLIDE_V0 * t + 0.5 * SLIDE_ACCEL * t * t;
            center = surfacePoint(dir, dd);
            streakAxis = downhill(dir, dd);
            streakLength = RUNOFF_LENGTH;
            strength = 0.8 * smoothstep(0.0, 0.12, t);   // fades in after the splash
          } else {
            // 3. Drip: leaves the rim at the speed it reached, then falls under
            // gravity, drifting slightly outward. One continuous motion.
            float td = t - slideTime;
            float rimSpeed = SLIDE_V0 + SLIDE_ACCEL * slideTime;
            center = surfacePoint(dir, uDomeSize.x)
              + vec3(dir.x, 0.0, dir.y) * 0.3 * td
              - vec3(0.0, rimSpeed * td + 0.5 * GRAVITY * td * td, 0.0);
            streakLength = clamp((rimSpeed + GRAVITY * td) * 0.02, 0.04, DRIP_LENGTH);
            strength = 0.8;
          }
        } else {
          hidden = true;   // absorbed: the dry space beneath the dome
        }
      }
    }

    // Camera-facing axes (from the view matrix's rows)
    vec3 cameraRight = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 cameraUp = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);

    vec3 world;
    if (mode == SPLASH) {
      float size = mix(0.02, SPLASH_SIZE, age);
      world = center + (cameraRight * position.x + cameraUp * position.y) * size;
    } else {
      // Streak along streakAxis; its width faces the camera (cross product of
      // the streak direction and the direction to the camera)
      vec3 toCamera = normalize(cameraPosition - center);
      vec3 across = normalize(cross(streakAxis, toCamera));
      world = center + streakAxis * position.y * streakLength + across * position.x * WIDTH;
    }

    vec4 viewPosition = modelViewMatrix * vec4(world, 1.0);
    // Hidden drops are moved outside the clip volume, so nothing is drawn
    gl_Position = hidden ? vec4(2.0, 2.0, 2.0, 1.0) : projectionMatrix * viewPosition;

    vUv = position.xy + 0.5;
    // Soft top and bottom edges, so drops never pop in or out
    float fadeIn = 1.0 - smoothstep(top - 0.6, top, center.y);
    float fadeOut = smoothstep(uRain.z - 0.6, uRain.z, center.y);
    vFade = fadeIn * fadeOut;
    // Accent color only on falling rain; water on the dome stays the main color
    vAccent = water ? 0.0 : aAccent;
    vMode = mode;
    vAge = age;
    vStrength = strength;
  }
`;

export const rainFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uOpacity;
  uniform float uVisibility; // 0–1: fades the whole shower in and out (Play/Pause)

  varying vec2 vUv;
  varying float vFade;
  varying float vAccent;
  varying float vMode;       // 0 streak, 1 splash ring
  varying float vAge;
  varying float vStrength;

  void main() {
    float alpha;
    if (vMode > 0.5) {
      // Splash: a thin ring that fades as it grows
      float r = length(vUv - 0.5) * 2.0;
      float ring = smoothstep(0.6, 0.8, r) * (1.0 - smoothstep(0.85, 1.0, r));
      alpha = uOpacity * 1.6 * ring * (1.0 - vAge);
    } else {
      // Bright head, fading tail — reads as motion
      alpha = uOpacity * smoothstep(0.0, 1.0, vUv.y);
    }
    gl_FragColor = vec4(mix(uColor, uAccent, vAccent), alpha * vFade * vStrength * uVisibility);
    // Convert from three.js's linear working space to the screen's color space
    #include <colorspace_fragment>
  }
`;
