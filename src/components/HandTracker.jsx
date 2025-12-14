import { useEffect, useRef } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';



export function HandTracker({ onHandUpdate, debug = false }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const landmarkerRef = useRef(null);

    useEffect(() => {
        let animationFrameId;

        const setupMediaPipe = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm'
            );

            landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: 'GPU',
                },
                runningMode: 'VIDEO',
                numHands: 1,
            });

            startWebcam();
        };

        const startWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720 },
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.addEventListener('loadeddata', predictWebcam);
                }
            } catch (err) {
                console.error('Error accessing webcam:', err);
            }
        };

        const predictWebcam = () => {
            if (!landmarkerRef.current || !videoRef.current || !canvasRef.current) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            if (video.videoWidth > 0 && video.videoHeight > 0) {
                // Prepare results
                const startTimeMs = performance.now();
                const result = landmarkerRef.current.detectForVideo(video, startTimeMs);

                // Debug drawing
                if (debug && ctx) {
                    // Match canvas size to video size
                    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                    }

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // const drawingUtils = new DrawingUtils(ctx);

                    if (result.landmarks) {
                        for (const landmarks of result.landmarks) {
                            // drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS);
                            // drawingUtils.drawLandmarks(landmarks, { radius: 1 });

                            // Simple fallback debug drawing
                            ctx.fillStyle = '#00FF00'; // Green for high contrast
                            ctx.strokeStyle = 'white';
                            ctx.lineWidth = 2;
                            for (const p of landmarks) {
                                ctx.beginPath();
                                ctx.arc(p.x * canvas.width, p.y * canvas.height, 8, 0, 2 * Math.PI); // Radius 8
                                ctx.fill();
                                ctx.stroke();
                            }
                        }
                    }
                }

                // Process data
                if (result.landmarks && result.landmarks.length > 0) {
                    const landmarks = result.landmarks[0];
                    const wrist = landmarks[0];
                    const middle = landmarks[9];
                    const centerX = (wrist.x + middle.x) / 2;
                    const centerY = (wrist.y + middle.y) / 2;

                    const thumbTip = landmarks[4];
                    const indexTip = landmarks[8];

                    // Gesture Detection
                    let currentGesture = 'Open';

                    // 1. Pinch Detection
                    const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
                    if (pinchDist < 0.05) {
                        currentGesture = 'Pinch';
                    } else {
                        // 2. Fist Detection
                        // Check if fingertips are close to wrist
                        // Landmarks: 8, 12, 16, 20 are tips. 0 is wrist.
                        const tips = [8, 12, 16, 20];
                        let avgDistToWrist = 0;
                        tips.forEach(idx => {
                            const tip = landmarks[idx];
                            avgDistToWrist += Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
                        });
                        avgDistToWrist /= 4;

                        // Heuristic: If average tip distance to wrist is small -> Fist
                        // Typical open hand dist is > 0.3 (normalized). Closed is < 0.15?
                        // Need calibration mentally. 
                        // Let's debug print this value if needed, but for now guess 0.15
                        if (avgDistToWrist < 0.20) {
                            currentGesture = 'Fist';
                        }
                    }

                    onHandUpdate({
                        landmarks: landmarks,
                        worldLandmarks: result.worldLandmarks[0],
                        isPresent: true,
                        gesture: currentGesture,
                        // Mirror X coordinate because we are analyzing a mirrored video feed
                        // Screen Right (User Right) -> x=1.0.
                        // MediaPipe on Mirrored Video -> Real Left of Frame -> x=0.0
                        // So we send (1 - 0) = 1.0 to Particle System
                        position: { x: 1.0 - centerX, y: centerY },
                    });
                } else {
                    onHandUpdate({
                        landmarks: [],
                        worldLandmarks: [],
                        isPresent: false,
                        gesture: 'None',
                        position: { x: 0, y: 0 },
                    });
                }
            }

            animationFrameId = requestAnimationFrame(predictWebcam);
        };

        setupMediaPipe();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                stream.getTracks().forEach(track => track.stop());
            }
            cancelAnimationFrame(animationFrameId);
        };
    }, [onHandUpdate, debug]);

    return (
        <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            zIndex: 50,
            width: '240px',
            height: '135px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.2)',
            backgroundColor: '#000',
            opacity: debug ? 1 : 0,
            pointerEvents: 'none'
        }}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)'
                }}
            />
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    transform: 'scaleX(-1)'
                }}
            />
        </div>
    );
}
