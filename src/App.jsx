import { useRef, useState } from 'react';
import { HandTracker } from './components/HandTracker';
import { Scene } from './components/Scene';
import './App.css';

function App() {
  const handDataRef = useRef({
    landmarks: [],
    worldLandmarks: [],
    isPresent: false,
    gesture: 'None',
    position: { x: 0, y: 0 },
  });

  const [debugMode, setDebugMode] = useState(true);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <HandTracker
        onHandUpdate={(data) => {
          handDataRef.current = data;
        }}
        debug={debugMode}
      />

      <Scene handData={handDataRef} />

      {/* Main Title Card */}
      <div className="absolute top-6 left-6 z-20 fade-in">
        <div className="glass-card gradient-border max-w-md">
          <h1 className="text-3xl font-bold gradient-text title-glow mb-3 tracking-wider">
            PARTICLE MOTION
          </h1>
          <p className="text-sm text-gray-300 mb-4 leading-relaxed">
            Control particles with your hand gestures in real-time
          </p>

          {/* Instructions */}
          <div className="space-y-2">
            <div className="instruction-item">
              <span className="text-2xl mr-3">⌨️</span>
              <span className="text-sm text-gray-200">Press <kbd className="px-2 py-1 bg-white/5 rounded text-gray-300 font-mono border border-white/10">Space</kbd> to switch shapes</span>
            </div>

            <div className="instruction-item">
              <span className="text-2xl mr-3">🖐</span>
              <span className="text-sm text-gray-200"><strong className="text-gray-100">Open Hand:</strong> Repel Particles</span>
            </div>

            <div className="instruction-item">
              <span className="text-2xl mr-3">✊</span>
              <span className="text-sm text-gray-200"><strong className="text-gray-100">Fist:</strong> Attract Particles</span>
            </div>

            <div className="instruction-item">
              <span className="text-2xl mr-3">👌</span>
              <span className="text-sm text-gray-200"><strong className="text-gray-100">Pinch:</strong> Next Shape <span className="text-xs text-gray-400">(2s cooldown)</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Toggle Card */}
      <div className="absolute bottom-6 left-6 z-20 fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="glass-card pulse-glow">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={debugMode}
              onChange={(e) => setDebugMode(e.target.checked)}
              className="custom-checkbox"
            />
            <span className="text-sm font-medium text-gray-200 select-none">
              Show Camera Debug
            </span>
          </label>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="absolute top-6 right-6 z-20 fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="glass-card text-center min-w-[120px]">
          <div className="text-xs text-gray-400 mb-1">Status</div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-green-400">Active</span>
          </div>
        </div>
      </div>

      {/* Gradient Overlay Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl floating" style={{ animationDelay: '1.5s' }}></div>
      </div>
    </div>
  );
}

export default App;
