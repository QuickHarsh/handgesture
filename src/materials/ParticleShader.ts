import * as THREE from 'three';


export const ParticleShaderMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    uniform float uTime;
    uniform float uMix;
    uniform float uSize;
    uniform vec3 uHandPosition;
    uniform bool uHandActive;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uForceStrength;

    attribute vec3 aPositionEnd;
    attribute float aSizeOffset;
    
    varying vec3 vColor;

    // Simplex noise or simple hash for movement
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      // Morphing
      vec3 posInitial = position; 
      vec3 posTarget = aPositionEnd;
      
      // Cubic easing
      float t = uMix;
      float eased = t * t * (3.0 - 2.0 * t);
      
      vec3 pos = mix(posInitial, posTarget, eased);

      // Idle noise
      float noiseFreq = 0.5;
      float noiseAmp = 0.1;
      pos.x += sin(uTime * noiseFreq + pos.y) * noiseAmp;
      pos.y += cos(uTime * noiseFreq + pos.z) * noiseAmp;
      pos.z += sin(uTime * noiseFreq + pos.x) * noiseAmp;

      // Interaction
      if (uHandActive) {
        float dist = distance(pos, uHandPosition);
        float radius = 2.0; // Interaction radius
        if (dist < radius) {
           float force = (radius - dist) * uForceStrength;
           vec3 dir = normalize(pos - uHandPosition);
           pos += dir * force;
        }
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      gl_PointSize = uSize * (10.0 / -mvPosition.z);
      gl_PointSize *= (1.0 + aSizeOffset);

      // Color mixing based on interactions or just time
      vec3 baseColor = mix(uColor1, uColor2, eased);
      float depth = (pos.z + 2.0) * 0.2; // Simple depth shading
      vColor = baseColor + depth * 0.1;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;

    void main() {
      // Circular soft particle
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float ll = length(xy);
      if (ll > 0.5) discard;
      
      float alpha = (0.5 - ll) * 2.0;
      gl_FragColor = vec4(vColor, alpha);
    }
  `,
  uniforms: {
    uTime: { value: 0 },
    uMix: { value: 0 },
    uSize: { value: 5.0 },
    uHandPosition: { value: new THREE.Vector3(0, 0, 0) },
    uHandActive: { value: false },
    uColor1: { value: new THREE.Color('#ff0000') },
    uColor2: { value: new THREE.Color('#0000ff') },
    uForceStrength: { value: 2.0 }
  },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});
