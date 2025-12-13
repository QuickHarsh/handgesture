import { useRef, useState } from 'react';
import { HandTracker, type HandData } from './components/HandTracker';
import { Scene } from './components/Scene';

function App() {
  const handDataRef = useRef<HandData>({
    landmarks: [],
    worldLandmarks: [],
    isPresent: false,
    gesture: 'None',
    position: { x: 0, y: 0 },
  });

  const [debugMode, setDebugMode] = useState(true);

  // Create a dummy state to force re-render of debug info if needed, 
  // but for performance, we won't drive main UI from the 60fps loop.
  // We can use a slow interval to update UI status.

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <HandTracker
        onHandUpdate={(data) => {
          handDataRef.current = data;
        }}
        debug={debugMode}
      />

      <Scene handData={handDataRef} />

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-20 text-white pointer-events-none">
        <h1 className="text-2xl font-bold tracking-wider mb-2">PARTICLE MOTION</h1>
        <p className="opacity-70 text-sm">Press [Space] to switch shapes</p>
        <p className="opacity-70 text-sm">Use Hand to interact</p>
        <p className="opacity-70 text-sm">🖐 Open Hand: Repel Particles</p>
        <p className="opacity-70 text-sm">✊ Fist: Attract Particles</p>
        <p className="opacity-70 text-sm">👌 Pinch: Next Shape (2s cooldown)</p>
      </div>

      <div className="absolute bottom-4 left-4 z-20 text-white">
        <label className="flex items-center space-x-2 cursor-pointer pointer-events-auto">
          <input
            type="checkbox"
            checked={debugMode}
            onChange={(e) => setDebugMode(e.target.checked)}
            className="rounded border-gray-600 bg-gray-800"
          />
          <span className="text-sm opacity-80">Show Camera Debug</span>
        </label>
      </div>
    </div>
  );
}

export default App;
