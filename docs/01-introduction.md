# Introduction & Project Overview

Welcome to the **Interactive Hand Gesture Particle System** documentation! This project is a real-time, 3D interactive web application where users can control a complex particle system using their hand gestures via a webcam.

## 🚀 high-Level Architecture

The project is built using modern web technologies:

*   **Front-End Framework**: [React](https://react.dev/) (v19) - Used for UI and component management.
*   **3D Engine**: [Three.js](https://threejs.org/) - A powerful WebGL library for rendering 3D graphics in the browser.
*   **React Integration**: [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) - A React renderer for Three.js, allowing us to build the 3D scene declaratively using React components.
*   **Computer Vision**: [MediaPipe Tasks Vision](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) - Google's machine learning library for real-time hand tracking and landmark detection directly in the browser.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) - For rapid UI styling.
*   **Build Tool**: [Vite](https://vitejs.dev/) - For fast development and bundling.

## 📂 Project Structure

Here is a quick map of the important files:

```
src/
├── components/
│   ├── HandTracker.tsx      # Handles Webcam & MediaPipe Logic
│   ├── ParticleSystem.tsx   # Manages the 20k particles & Logic
│   └── Scene.tsx            # The 3D Canvas & Camera setup
├── materials/
│   └── ParticleShader.ts    # Custom GLSL code for GPU rendering
├── utils/
│   └── shapes.ts            # Math formulas for generating shapes
├── App.tsx                  # Main entry point & UI Overlay
└── main.tsx                 # React DOM root
```

## 💡 Core Concepts

1.  **Reaction to State**: The application is state-driven. When MediaPipe detects a hand, it updates a `HandData` reference. The 3D scene reads this data *every frame* (60 times a second) to update the simulation.
2.  **GPU Acceleration**: Instead of updating 20,000 particles on the CPU (which would be slow), we use **Custom Shaders**. The CPU only sends the hand position and time to the GPU, and the GPU calculates the position of every single particle in parallel.
3.  **Ref-based Optimization**: You will notice we often use `useRef` instead of `useState` for things that change rapidly (like hand position). This avoids re-rendering the entire React component tree 60 times a second, ensuring smooth performance.
