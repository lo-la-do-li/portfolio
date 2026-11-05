// Points drawn by a custom shader so the cursor "lens" runs entirely on the GPU. Near
// the pointer, screen space is magnified (a fisheye, up to 1 + uMagnify times), and the
// stars there grow and shift toward the highlight color, as if they were closer.
export const vertexShader = /* glsl */ `
  uniform vec2 uPointer;
  uniform float uStrength;
  uniform float uAspect;
  uniform float uRadius;
  uniform float uMagnify;
  uniform float uSize;
  uniform float uScale;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vLens;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec4 clip = projectionMatrix * mv;

    // Distance from the pointer in half-heights, so the lens is a circle, not an oval
    vec2 d = clip.xy / clip.w - uPointer;
    d.x *= uAspect;
    float lens = (1.0 - smoothstep(0.0, uRadius, length(d))) * uStrength;

    d *= lens * uMagnify;
    d.x /= uAspect;
    clip.xy += d * clip.w;

    gl_Position = clip;
    // Same size attenuation as three's PointsMaterial (uScale is half the canvas height)
    gl_PointSize = uSize * (uScale / -mv.z) * (1.0 + lens * 1.5);
    vColor = aColor;
    vLens = lens;
  }
`;

export const fragmentShader = /* glsl */ `
  uniform vec3 uHighlight;
  varying vec3 vColor;
  varying float vLens;

  void main() {
    vec2 c = gl_PointCoord * 2.0 - 1.0;
    if (dot(c, c) > 1.0) discard;
    gl_FragColor = vec4(mix(vColor, uHighlight, vLens * 0.4), 1.0);
    #include <colorspace_fragment>
  }
`;
