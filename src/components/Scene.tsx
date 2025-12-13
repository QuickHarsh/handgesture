import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { ParticleSystem } from './ParticleSystem';
import { type HandData } from './HandTracker';

interface SceneProps {
    handData: React.MutableRefObject<HandData>;
}

export function Scene({ handData }: SceneProps) {
    return (
        <div className="absolute inset-0 z-0 bg-black">
            <Canvas
                camera={{ position: [0, 0, 12], fov: 60 }}
                dpr={[1, 2]}
                gl={{ alpha: false, antialias: false }} // Optimization for postprocessing
            >
                <OrbitControls makeDefault enableZoom={false} enablePan={false} />
                <ParticleSystem handData={handData} />
                <EffectComposer>
                    <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.4} />
                </EffectComposer>
            </Canvas>
        </div>
    );
}
