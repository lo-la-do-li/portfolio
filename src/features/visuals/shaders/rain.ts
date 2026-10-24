// GLSL for the hero rain. Every drop is one instance of a tiny quad; its whole
// state — falling, hitting the invisible dome, splashing — is computed on the
// GPU from time and its per-drop seed. Nothing is stored between frames: the
// CPU only updates `uTime` (and later the dome's position).

export const rainVertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uFallRange;   // y: bottom, top (world units)
  uniform vec3 uDome;        // center of the dome's rim (world units)
  uniform vec2 uDomeSize;    // radius, height

  attribute vec4 aSeed;      // world x, world z, fall phase (0–1), speed factor
  attribute float aAccent;   // 1.0 for accent-colored drops

  varying vec2 vUv;
  varying float vFade;       // depth fade: far drops are fainter
  varying float vAccent;
  varying float vSplash;     // 1.0 while this drop is drawn as a splash
  varying float vSplashAge;  // 0 → 1 over the splash's life

  const float SPEED = 9.0;          // world units per second
  const float LENGTH = 0.35;        // streak length
  const float WIDTH = 0.012;        // streak width
  const float SPLASH_TIME = 0.22;   // seconds
  const float SPLASH_SIZE = 0.09;   // final ring diameter

  void main() {
    float speed = SPEED * aSeed.w;

    // Falling forever: height wraps around the fall range (mod works like a
    // clock face), offset by each drop's phase so they don't move in lockstep.
    float span = uFallRange.y - uFallRange.x;
    float fallen = mod(aSeed.z * span + uTime * speed, span);
    vec3 center = vec3(aSeed.x, uFallRange.y - fallen, aSeed.y);

    // --- The invisible dome: top half of an ellipsoid ---
    // How far is this drop's column from the dome's vertical axis?
    float d = length(center.xz - uDome.xz);
    float splash = 0.0;
    float splashAge = 0.0;
    bool absorbed = false;
    if (d < uDomeSize.x) {
      // Surface height above this column: tallest at the center, zero at the rim
      float k = d / uDomeSize.x;
      float surface = uDome.y + uDomeSize.y * sqrt(1.0 - k * k);
      // Positive once the drop has passed the surface
      float sinceImpact = (surface - center.y) / speed;
      if (sinceImpact > 0.0) {
        if (sinceImpact < SPLASH_TIME) {
          splash = 1.0;
          splashAge = sinceImpact / SPLASH_TIME;
          center.y = surface;           // the splash sits on the surface
        } else {
          absorbed = true;              // dry space beneath the dome
        }
      }
    }

    // Camera-facing axes (from the view matrix's rows)
    vec3 cameraRight = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 cameraUp = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);

    vec3 world;
    if (splash > 0.5) {
      // Square sprite that grows over the splash's life
      float size = mix(0.02, SPLASH_SIZE, splashAge);
      world = center + (cameraRight * position.x + cameraUp * position.y) * size;
    } else {
      // Thin vertical streak that always faces the camera
      world = center + vec3(0.0, position.y * LENGTH, 0.0) + cameraRight * position.x * WIDTH;
    }

    vec4 viewPosition = modelViewMatrix * vec4(world, 1.0);
    // Absorbed drops are moved outside the clip volume, so nothing is drawn
    gl_Position = absorbed ? vec4(2.0, 2.0, 2.0, 1.0) : projectionMatrix * viewPosition;

    vUv = position.xy + 0.5;
    // Near slab (~5 units away) at full strength; distant rain much fainter, so
    // it reads as background rather than filling the dry space
    vFade = smoothstep(13.0, 4.5, -viewPosition.z);
    vAccent = aAccent;
    vSplash = splash;
    vSplashAge = splashAge;
  }
`;

export const rainFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uOpacity;

  varying vec2 vUv;
  varying float vFade;
  varying float vAccent;
  varying float vSplash;
  varying float vSplashAge;

  void main() {
    float alpha;
    if (vSplash > 0.5) {
      // A thin ring that fades as it grows
      float r = length(vUv - 0.5) * 2.0;
      float ring = smoothstep(0.6, 0.8, r) * (1.0 - smoothstep(0.85, 1.0, r));
      alpha = uOpacity * 1.6 * ring * (1.0 - vSplashAge);
    } else {
      // Bright head, fading tail — reads as motion
      alpha = uOpacity * smoothstep(0.0, 1.0, vUv.y);
    }
    gl_FragColor = vec4(mix(uColor, uAccent, vAccent), alpha * vFade);
    // Convert from three.js's linear working space to the screen's color space
    #include <colorspace_fragment>
  }
`;
