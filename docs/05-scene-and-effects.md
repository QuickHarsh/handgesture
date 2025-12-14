# Scene & Visual Effects

The `Scene` component sets up the "stage" for our 3D world.

**File**: `src/components/Scene.tsx`

## 🎭 The Canvas
The `<Canvas>` component from `@react-three/fiber` is the root of our 3D world.
```tsx
<Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
```
*   **Camera**: We position it at `z=12` so we can see the whole shape.
*   **OrbitControls**: Allows you to rotate around the shape (disabled for zoom/pan to keep the experience focused).

## ✨ Post-Processing (Bloom)

To make the particles "glow", we use post-processing. This happens *after* the scene is drawn.

```tsx
<EffectComposer>
   <Bloom 
     luminanceThreshold={0.2} // Only bright things glow
     intensity={1.5}          // How strong the glow is
     mipmapBlur               // Makes the glow soft and extensive
   />
</EffectComposer>
```
*   **Why Bloom?**: Hand gestures feel "magical". Glowing particles reinforce this sci-fi/magical aesthetic.
*   **Performance**: Bloom is expensive. we use `mipmapBlur` which is a faster technique than standard Gaussian blur.

## 🌅 Lighting?
We actually **don't** used standard lights (AmbientLight, DirectionalLight).
Why? Because our particles use a custom shader (`ParticleShaderMaterial`) that emits its own color (`gl_FragColor`). They are "self-illuminated". This saves performance because the GPU doesn't have to calculate shadows or reflections.
