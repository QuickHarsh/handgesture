import { describe, it, expect } from 'vitest';
import { generateShape } from './shapes';

describe('generateShape', () => {
    it('should generate the correct number of coordinates for default count', () => {
        const count = 20000;
        const coords = generateShape('sphere', count);
        expect(coords.length).toBe(count * 3);
    });

    it('should generate correct number of coordinates for custom count', () => {
        const count = 100;
        const coords = generateShape('heart', count);
        expect(coords.length).toBe(count * 3);
    });

    it('should handle different shapes without crashing', () => {
        const shapes = ['sphere', 'heart', 'flower', 'saturn', 'spiral'] as const;
        shapes.forEach(shape => {
            const coords = generateShape(shape, 10);
            expect(coords.length).toBe(30);
            // Check for NaN
            for (let i = 0; i < coords.length; i++) {
                expect(coords[i]).not.toBeNaN();
            }
        });
    });

    it('should generate values within reasonable bounds (roughly)', () => {
        const radius = 2;
        const coords = generateShape('sphere', 100, radius);
        // Sphere with radius 2 should be roughly within -2 to 2
        for (let i = 0; i < coords.length; i++) {
            expect(Math.abs(coords[i])).toBeLessThanOrEqual(radius + 0.1); // +0.1 for float error margin
        }
    });
});
