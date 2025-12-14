# Hand Tracking Explained

The **Hand Tracking** module is the "eyes" of our application. It uses your webcam to understand where your hand is and what it is doing.

**File**: `src/components/HandTracker.tsx`

## 🛠 How it Works

We use **MediaPipe Hand Landmarker**, a machine learning model optimized for the web.

1.  **Initialization**:
    *   We load the WASM (WebAssembly) files locally or from a CDN.
    *   We configure the `HandLandmarker` model to run in `VIDEO` mode (optimized for streams) and `GPU` delegate (faster).

2.  **The Loop (`predictWebcam`)**:
    This function runs on every animation frame:
    ```javascript
    const result = landmarkerRef.current.detectForVideo(video, startTimeMs);
    ```
    It takes the current video frame and returns a `HandLandmarkerResult`.

3.  **Data Extraction**:
    If a hand is found, we get a list of 21 "landmarks". Each landmark is a 3D point (x, y, z).
    *   **Position**: We calculate the center of the hand by averaging the **Wrist** (index 0) and the **Middle Finger Knuckle** (index 9).
    *   **Pinch Detection**: We calculate the Euclidean distance between the **Thumb Tip** (4) and **Index Finger Tip** (8). If distance < 0.05, it counts as a Pinch.
    *   **Fist Detection**: We check the average distance of all **Finger Tips** (8, 12, 16, 20) to the **Wrist** (0). If they are all close, it's a Fist.

4.  **Coordinate Mapping (Mirroring)**:
    Since webcams act like mirrors (you move right, image moves left), we have to flip the X coordinate before sending it to the 3D world:
    ```typescript
    position: { x: 1.0 - centerX, y: centerY }
    ```
    This ensures that when you move your hand to the *right* of your screen, the 3D particles on the *right* side react.

## 👨‍💻 Key Code Snippet

```typescript
// Inside HandTracker.tsx

// 1. Detect
const result = landmarker.detectForVideo(video, time);

// 2. Process
if (result.landmarks.length > 0) {
    const hand = result.landmarks[0];
    
    // Calculate Pinch
    const pinchDist = Math.hypot(hand[4].x - hand[8].x, hand[4].y - hand[8].y);
    const isPinch = pinchDist < 0.05;

    // Send data up to parent
    onHandUpdate({
        isPresent: true,
        gesture: isPinch ? 'Pinch' : 'Open',
        position: { x: 1.0 - centerX, y: centerY } // <--- Note the mirror!
    });
}
```
