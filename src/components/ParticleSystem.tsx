import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { generateShape, type ShapeType } from '../utils/shapes';
import { ParticleShaderMaterial } from '../materials/ParticleShader';
import { type HandData } from './HandTracker';

interface ParticleSystemProps {
    handData: React.MutableRefObject<HandData>;
}

const COUNT = 20000;
const SHAPES: ShapeType[] = ['sphere', 'heart', 'flower', 'saturn', 'spiral', 'dna'];
const COLORS = [
    ['#ff0088', '#00ffff'], // sphere
    ['#ff0000', '#ff8800'], // heart
    ['#ff00ff', '#ffffff'], // flower
    ['#ffa500', '#888888'], // saturn
    ['#00ff00', '#0000ff'], // spiral
    ['#00ff88', '#0088ff'], // dna
];

export function ParticleSystem({ handData }: ParticleSystemProps) {
    const meshRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { viewport } = useThree();

    // Store all shapes data in memory
    const shapesData = useMemo(() => {
        const data: Record<string, Float32Array> = {};
        SHAPES.forEach(type => {
            data[type] = generateShape(type, COUNT, 3);
        });
        return data;
    }, []);

    const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
    const [isMorphing, setIsMorphing] = useState(false);
    const morphProgress = useRef(0);
    const lastPinchTime = useRef(0);
    const morphSpeed = 1.5; // speed of transition

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(shapesData[SHAPES[0]].slice(), 3)); // Start with sphere
        geo.setAttribute('aPositionEnd', new THREE.BufferAttribute(shapesData[SHAPES[0]].slice(), 3)); // Target same initially

        // Size variation
        const sizes = new Float32Array(COUNT);
        for (let i = 0; i < COUNT; i++) sizes[i] = Math.random();
        geo.setAttribute('aSizeOffset', new THREE.BufferAttribute(sizes, 1));

        return geo;
    }, [shapesData]);

    // Gestures control
    useEffect(() => {
        const checkGesture = () => {
            if (!handData.current.isPresent) return;

            const { gesture } = handData.current;
            if (gesture === 'Pinch' && !isMorphing) {
                // Trigger generic shape switch on pinch? 
                // Or maybe just random for now?
                // Let's cycle shapes on pinch
                // Debounce?
            }
        };
        checkGesture();
        // Interval or inside useFrame? useFrame is better for continuous, interval for distinct triggers.
        // For now, let's auto-cycle every 5 seconds OR interactions
        // We'll trust the user wants interactive control.
        // Let's cycle shapes loop for demo, pause if hand is interacting?
    }, [isMorphing]);

    useFrame((state, delta) => {
        if (!materialRef.current || !meshRef.current) return;

        // Time
        materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

        // Hand Interaction
        if (handData.current.isPresent) {
            // Map 2D hand pos to 3D roughly
            // Normalized: x (0..1), y (0..1)
            const hx = (handData.current.position.x - 0.5) * viewport.width;
            const hy = -(handData.current.position.y - 0.5) * viewport.height;

            // We assume Z=0 for interaction plane
            const handPos = new THREE.Vector3(hx, hy, 0);
            materialRef.current.uniforms.uHandPosition.value.lerp(handPos, 0.1);
            materialRef.current.uniforms.uHandActive.value = true;

            // Map gesture to forces
            // Fist = Attraction (Negative force)
            // Open = Repulsion (Positive force)
            // Default = Weak repulsion
            let targetForce = 2.0; // Default repulsion
            if (handData.current.gesture === 'Fist') {
                targetForce = -4.0; // Strong attraction
            } else if (handData.current.gesture === 'Open') {
                targetForce = 4.0; // Strong repulsion
            }

            // Smooth transition of force
            const currentForce = materialRef.current.uniforms.uForceStrength.value;
            materialRef.current.uniforms.uForceStrength.value = THREE.MathUtils.lerp(currentForce, targetForce, 0.1);

            // Gesture to switch shape?
            // Cooldown logic
            const now = state.clock.elapsedTime;
            if (handData.current.gesture === 'Pinch' && !isMorphing) {
                // Check cooldown (e.g., 2 seconds)
                if (now - lastPinchTime.current > 2.0) {
                    lastPinchTime.current = now;
                    changeShape((currentShapeIndex + 1) % SHAPES.length);
                }
            }
        } else {
            materialRef.current.uniforms.uHandActive.value = false;
        }

        // Morphing Logic
        if (isMorphing) {
            morphProgress.current += delta * morphSpeed;
            if (morphProgress.current >= 1.0) {
                morphProgress.current = 1.0;
                setIsMorphing(false);

                // Finalize state: copy End to Start, reset Mix
                const nextShape = SHAPES[currentShapeIndex];
                const nextPos = shapesData[nextShape];

                // Update 'position' attribute
                geometry.attributes.position.array.set(nextPos);
                geometry.attributes.position.needsUpdate = true;

                // Reset shader mix
                materialRef.current.uniforms.uMix.value = 0;
                morphProgress.current = 0;
            } else {
                materialRef.current.uniforms.uMix.value = morphProgress.current;
            }
        }
    });

    const changeShape = (index: number) => {
        if (isMorphing || index === currentShapeIndex) return;

        // Setup transition
        const nextShape = SHAPES[index];
        geometry.attributes.aPositionEnd.array.set(shapesData[nextShape]);
        geometry.attributes.aPositionEnd.needsUpdate = true;

        // Update target colors
        const colors = COLORS[index];
        materialRef.current!.uniforms.uColor1.value.set(colors[0]);
        materialRef.current!.uniforms.uColor2.value.set(colors[1]);

        setCurrentShapeIndex(index);
        setIsMorphing(true);
        morphProgress.current = 0;
    };

    // Expose changeShape to global or context?
    // For now we'll put some UI buttons in App.tsx that control this, 
    // but better to expose via a Ref or useStore. 
    // Let's attach it to window for debug/UI for now or just pass a callback?
    // Actually, let's cycle automatically if no interaction, OR expose function.
    // I'll make a small UI inside Scene or sibling to ParticleSystem that calls this.

    // Temporary: change on interval if no hand?
    // Or better: Just use local effects.

    // Let's bind 'Spcae' key to switch shape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                changeShape((currentShapeIndex + 1) % SHAPES.length);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [currentShapeIndex, isMorphing]);

    return (
        <points ref={meshRef} geometry={geometry}>
            <primitive object={ParticleShaderMaterial} ref={materialRef} attach="material" />
        </points>
    );
}
