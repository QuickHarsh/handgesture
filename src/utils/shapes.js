

const COUNT = 20000; // Number of particles

export function generateShape(type, count = COUNT, radius = 2) {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        let x = 0, y = 0, z = 0;
        const i3 = i * 3;

        switch (type) {
            case 'sphere': {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);
                const r = Math.cbrt(Math.random()) * radius; // Uniform distribution inside sphere
                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta);
                z = r * Math.cos(phi);
                break;
            }
            case 'heart': {
                // Heart surface or volume
                // Simple parametric heart:
                // x = 16sin^3(t)
                // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
                // Rotate to form 3D? or just sample random points in equation
                // Let's use a distribution
                // Fallback to simple 2D extruded or just the curve with spread
                const t = Math.random() * Math.PI * 2;
                const hx = 16 * Math.pow(Math.sin(t), 3);
                const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

                // normalize approx to radius
                const s = radius * 0.15; // scale
                x = hx * s;
                y = hy * s;
                z = (Math.random() - 0.5) * radius; // Thickness
                break;
            }
            case 'flower': {
                // Rose curve or similar
                const u = Math.random() * Math.PI * 2;
                const k = 5; // petals
                const r = Math.cos(k * u) * radius;
                x = r * Math.cos(u);
                y = r * Math.sin(u);
                z = (Math.random() - 0.5) * (radius * 0.5); // some depth

                // Add some randomness to fill
                x += (Math.random() - 0.5) * 0.2;
                y += (Math.random() - 0.5) * 0.2;
                break;
            }
            case 'spiral': {
                const t = i / count * 20 * Math.PI;
                const r = (i / count) * radius;
                x = r * Math.cos(t);
                y = r * Math.sin(t);
                z = (Math.random() - 0.5) * 2;
                break;
            }
            case 'saturn': {
                // Sphere + Ring
                if (Math.random() > 0.4) {
                    // Ring
                    const angle = Math.random() * Math.PI * 2;
                    const r = radius * (1.2 + Math.random() * 0.8);
                    x = r * Math.cos(angle);
                    z = r * Math.sin(angle); // Ring in XZ plane
                    y = (Math.random() - 0.5) * 0.2;
                } else {
                    // Planet body
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos((Math.random() * 2) - 1);
                    const r = radius * 0.8;
                    x = r * Math.sin(phi) * Math.cos(theta);
                    y = r * Math.sin(phi) * Math.sin(theta);
                    z = r * Math.cos(phi);
                }
                break;
            }
            case 'dna': {
                // Double Helix
                // Normalize i to -1 to 1 for length
                const t = ((i / count) * 2 - 1) * 4 * Math.PI; // 2 turns?
                const r = radius * 0.8;

                // Split into two strands
                const strand = i % 2 === 0 ? 0 : Math.PI;

                x = r * Math.cos(t + strand);
                y = r * Math.sin(t + strand);
                z = t * (radius * 0.25); // stretch along Z

                // Add thickness/fuzziness
                x += (Math.random() - 0.5) * 0.3;
                y += (Math.random() - 0.5) * 0.3;
                z += (Math.random() - 0.5) * 0.3;
                break;
            }
        }

        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
    }

    return positions;
}
