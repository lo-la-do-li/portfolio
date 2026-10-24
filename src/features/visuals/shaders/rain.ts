// GLSL for the hero rain. Every drop is one instance of a tiny quad; its whole
// position is computed on the GPU from time and its per-drop seed, so the CPU
// only updates `uTime` each frame — no per-drop JavaScript at all.

export const rainVertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uBoxX;      // x range: min, max (world units)
  uniform vec2 uBoxY;      // y range: bottom, top
  uniform vec2 uBoxZ;      // z range: far, near

  attribute vec4 aSeed;    // x, z position (0–1), fall phase (0–1), speed factor
  attribute float aAccent; // 1.0 for accent-colored drops

  varying float vAlong;    // 0 at the streak's tail, 1 at its head
  varying float vFade;     // depth fade: far drops are fainter
  varying float vAccent;

  const float SPEED = 9.0;     // world units per second
  const float LENGTH = 0.35;   // streak length
  const float WIDTH = 0.012;   // streak width

  void main() {
    // Each drop falls forever: its height wraps around the box, offset by its
    // own phase so drops don't move in lockstep.
    float height = uBoxY.y - uBoxY.x;
    float fallen = mod(aSeed.z * height + uTime * SPEED * aSeed.w, height);
    vec3 center = vec3(
      mix(uBoxX.x, uBoxX.y, aSeed.x),
      uBoxY.y - fallen,
      mix(uBoxZ.x, uBoxZ.y, aSeed.y)
    );

    // Turn the 1×1 quad into a streak: stretch it vertically in world space and
    // widen it along the camera's right vector so it always faces the viewer.
    vec3 cameraRight = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 world = center
      + vec3(0.0, position.y * LENGTH, 0.0)
      + cameraRight * position.x * WIDTH;

    vec4 viewPosition = modelViewMatrix * vec4(world, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    vAlong = position.y + 0.5;
    vFade = smoothstep(16.0, 3.0, -viewPosition.z);
    vAccent = aAccent;
  }
`;

export const rainFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uOpacity;

  varying float vAlong;
  varying float vFade;
  varying float vAccent;

  void main() {
    // Bright head, fading tail — reads as motion
    float alpha = uOpacity * vFade * smoothstep(0.0, 1.0, vAlong);
    gl_FragColor = vec4(mix(uColor, uAccent, vAccent), alpha);
    // Convert from three.js's linear working space to the screen's color space
    #include <colorspace_fragment>
  }
`;
