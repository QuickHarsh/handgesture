# Shaders and Mathematics

This project relies heavily on **GLSL (OpenGL Shading Language)** to render 20,000 particles at 60 FPS.

**File**: `src/materials/ParticleShader.ts`
**File**: `src/utils/shapes.ts`

## 🎨 Vertex Shader Explained

The vertex shader runs once for *each particle*. Its job is to decide where the particle is on the screen.

```glsl
void main() {
  // 1. Morphing
  vec3 posInitial = position;
  vec3 posTarget = aPositionEnd;
  float t = uMix;
  // Cubic easing for smooth movement
  float eased = t * t * (3.0 - 2.0 * t);
  vec3 pos = mix(posInitial, posTarget, eased);

  // 2. Interaction (Physics)
  float dist = distance(pos, uHandPosition);
  if (dist < 2.0) {
     // Force Field Math
     float force = (2.0 - dist) * uForceStrength;
     vec3 dir = normalize(pos - uHandPosition);
     pos += dir * force;
  }
}
```
*   **Morphing**: We use a `mix()` function to blend between the start shape and the end shape based on `uMix`.
*   **Physics**: If a particle is close to the hand (`dist < 2.0`), we push it away (or pull it in) by adding to its `pos`.

## 📐 Shape Generation Math

All shapes are generated using parametric equations in `shapes.ts`.

### Example: DNA Helix
DNA is just two sine waves offset by PI (180 degrees), twisting as they go up.
```typescript
case 'dna': {
    // t goes from -2*PI to 2*PI (length of strand)
    const t = ...; 
    
    // Strand 1 vs Strand 2 logic
    const strandOffset = i % 2 === 0 ? 0 : Math.PI;

    x = radius * Math.cos(t + strandOffset); // Circle X
    y = radius * Math.sin(t + strandOffset); // Circle Y
    z = t * stretchFactor;                   // Move along Z axis
}
```

### Example: Heart
```typescript
x = 16 * sin(t)^3
y = 13 * cos(t) - 5 * cos(2*t) - 2 * cos(3*t) - ...
```
These formulas act as a map for where each particle should sit when in that "shape".
