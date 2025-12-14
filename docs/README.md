# 🖐 Interactive Hand Gesture Particle System - Documentation

Welcome to the full technical documentation for the project. These guides are designed to help you understand every part of the codebase, from the React setup to the complex 3D math.

## 📚 Table of Contents

1.  **[Introduction & Overview](./01-introduction.md)**
    *   High-level architecture.
    *   Tech stack explanation (React, Three.js, MediaPipe).
    *   Folder structure map.

2.  **[Hand Tracking Logic](./02-hand-tracking.md)**
    *   How `HandTracker.tsx` works.
    *   Understanding MediaPipe landmarks.
    *   How we detect "Pinch" and "Fist" gestures.
    *   Coordinate mirroring logic.

3.  **[Particle System Architecture](./03-particle-system.md)**
    *   How we render 20,000 particles efficiently.
    *   Buffers and Geometry.
    *   The "Morphing" technique explained.
    *   The Interaction Loop (`useFrame`).

4.  **[Shaders & Mathematics](./04-shaders-and-math.md)**
    *   Deep dive into `ParticleShader.ts`.
    *   GLSL Vertex Shader logic.
    *   The math formulas behind DNA, Heart, and Sphere shapes.

5.  **[Scene & Visual Effects](./05-scene-and-effects.md)**
    *   Setting up the R3F `<Canvas>`.
    *   The **Bloom** effect (Post-processing).
    *   Camera and Controls setup.

## 🚀 Quick Start
If you just want to run the code:
```bash
npm install
npm run dev
```
Open `http://localhost:5173` and allow camera access.
