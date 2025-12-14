# Particle System Architecture

The **Particle System** is the visual core of the app. It manages 20,000 individual points that can morph into different shapes.

**File**: `src/components/ParticleSystem.tsx`

## ⚛ React Three Fiber Implementation

We use a `<points>` object in Three.js.

```tsx
<points ref={meshRef} geometry={geometry}>
    <primitive object={ParticleShaderMaterial} ... />
</points>
```

### 1. The Geometry
Instead of creating 20,000 separate sphere objects (which would crash the browser), we use **BufferGeometry**.
*   We have one geometry object.
*   It has an attribute `position` which contains a massive array of numbers `[x1, y1, z1, x2, y2, z2, ...]`.
*   We also have custom attributes like `aPositionEnd` (where the particle wants to go) and `aSizeOffset` (random size variation).

### 2. The Morphing Logic
How do we move from a Sphere to a Heart?
1.  We pre-calculate the positions for *all* shapes using `src/utils/shapes.ts` and store them in memory.
2.  When a switch triggers:
    *   We copy the *current* positions to the start state.
    *   We copy the *target* positions (e.g., Heart positions) to the `aPositionEnd` attribute buffer.
    *   We set a `uMix` uniform to `0.0`.
3.  Every frame, we increase `uMix` from 0 to 1. The GPU interpolates between the start and end positions.

### 3. Interaction Loop
Inside `useFrame`, we bridge the gap between `HandTracker` and the Shader:

```typescript
useFrame((state) => {
    // 1. Read latest hand data
    const hand = handData.current;
    
    // 2. Convert 2D screen coords to 3D world coords
    // (viewport.width is the width of the 3D scene in units)
    const hx = (hand.position.x - 0.5) * viewport.width;
    const hy = -(hand.position.y - 0.5) * viewport.height;
    
    // 3. Update Shader Uniforms
    materialRef.current.uniforms.uHandPosition.value.lerp(new Vector3(hx, hy, 0), 0.1);
    
    // 4. Handle Gestures
    if (hand.gesture === 'Fist') {
         // Set attraction force
         material.uniforms.uForceStrength.value = -4.0;
    }
});
```

This ensures the GPU always knows where the hand is, without React re-rendering the component tree.
