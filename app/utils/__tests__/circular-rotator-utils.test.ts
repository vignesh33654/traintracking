import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getPositionOnPath, getPathTotalLength } from '../circular-rotator-utils';
import { TRACK_PATH_CONFIG } from '../../config/circular-rotator.config';
import { resetCache } from '../track-path';

describe('circular-rotator-utils SSR/Hydration Consistency', () => {
  describe('getPositionOnPath - SSR vs Browser Consistency', () => {
    // Test critical progress points
    const testPoints = [
      { progress: 0, description: 'start (top left)' },
      { progress: 0.25, description: 'quarter way (bottom left before arc)' },
      { progress: 0.5, description: 'middle (bottom arc)' },
      { progress: 0.75, description: 'three-quarter way (bottom right after arc)' },
      { progress: 1, description: 'end (top right)' },
      // Additional edge cases
      { progress: 0.1, description: 'left rail 10%' },
      { progress: 0.4, description: 'entering arc' },
      { progress: 0.6, description: 'exiting arc' },
      { progress: 0.9, description: 'right rail 90%' },
    ];

    testPoints.forEach(({ progress, description }) => {
      it(`should produce consistent results at progress ${progress} (${description})`, () => {
        // Get position using browser-based method (if available)
        const browserResult = getPositionOnPath(progress);

        // Mock SSR environment by temporarily removing document
        const originalDocument = global.document;
        // @ts-expect-error - intentionally simulating SSR
        delete global.document;
        resetCache(); // Clear cache before SSR test

        // Get position using fallback method
        const ssrResult = getPositionOnPath(progress);

        // Restore document
        global.document = originalDocument;
        resetCache(); // Clear cache after SSR test

        // Verify positions are close enough (allow 0.5px tolerance for floating point)
        expect(Math.abs(browserResult.x - ssrResult.x)).toBeLessThan(0.5);
        expect(Math.abs(browserResult.y - ssrResult.y)).toBeLessThan(0.5);

        // Verify rotation angles are close (allow 1 degree tolerance)
        const rotationDiff = Math.abs(browserResult.rotation - ssrResult.rotation);
        expect(rotationDiff).toBeLessThan(1);
      });
    });

    it('should handle out-of-bounds progress values consistently', () => {
      const testValues = [-0.5, -0.1, 1.1, 1.5];

      testValues.forEach((progress) => {
        const browserResult = getPositionOnPath(progress);

        const originalDocument = global.document;
        // @ts-expect-error - intentionally simulating SSR
        delete global.document;
        resetCache();
        const ssrResult = getPositionOnPath(progress);
        global.document = originalDocument;
        resetCache();

        // Should clamp to 0-1 range
        expect(Math.abs(browserResult.x - ssrResult.x)).toBeLessThan(0.5);
        expect(Math.abs(browserResult.y - ssrResult.y)).toBeLessThan(0.5);
      });
    });

    it('should produce valid positions on the track path', () => {
      const { leftRailX, rightRailX, railTop, arcStartY } = TRACK_PATH_CONFIG;

      // Test that all positions stay within bounds
      for (let i = 0; i <= 100; i++) {
        const progress = i / 100;
        const pos = getPositionOnPath(progress);

        // X should be between left and right rails (with arc radius tolerance)
        expect(pos.x).toBeGreaterThanOrEqual(leftRailX - 1);
        expect(pos.x).toBeLessThanOrEqual(rightRailX + 1);

        // Y should be between railTop and arcStartY (with arc radius tolerance)
        expect(pos.y).toBeGreaterThanOrEqual(railTop - 1);
        expect(pos.y).toBeLessThanOrEqual(arcStartY + 145); // arcRadius + small margin
      }
    });
  });

  describe('getPathTotalLength', () => {
    it('should return consistent length regardless of environment', () => {
      // Get length with browser
      const browserLength = getPathTotalLength();

      // Mock SSR environment
      const originalDocument = global.document;
      // @ts-expect-error - intentionally simulating SSR
      delete global.document;
      resetCache();

      // Get length without browser
      const ssrLength = getPathTotalLength();

      // Restore document
      global.document = originalDocument;
      resetCache();

      // Should return the same value (within floating point tolerance)
      expect(Math.abs(browserLength - ssrLength)).toBeLessThan(0.01);
    });

    it('should calculate expected path length based on config', () => {
      const { railTop, arcStartY, arcRadius } = TRACK_PATH_CONFIG;
      const straightLength = arcStartY - railTop;
      const arcLength = Math.PI * arcRadius;
      const expectedLength = 2 * straightLength + arcLength;

      const actualLength = getPathTotalLength();

      // Should match mathematical expectation (within 1px tolerance)
      expect(Math.abs(actualLength - expectedLength)).toBeLessThan(1);
    });
  });

  describe('Arc center calculation consistency', () => {
    it('should calculate arc center consistently', () => {
      const { leftRailX, rightRailX } = TRACK_PATH_CONFIG;

      // Arc center should be midpoint between rails
      const expectedCenterX = (leftRailX + rightRailX) / 2;

      // Test position at middle of arc (progress = 0.5)
      const browserPos = getPositionOnPath(0.5);

      const originalDocument = global.document;
      // @ts-expect-error - intentionally simulating SSR
      delete global.document;
      resetCache();
      const ssrPos = getPositionOnPath(0.5);
      global.document = originalDocument;
      resetCache();

      // Both should be close to center X
      expect(Math.abs(browserPos.x - expectedCenterX)).toBeLessThan(10);
      expect(Math.abs(ssrPos.x - expectedCenterX)).toBeLessThan(10);

      // And should match each other
      expect(Math.abs(browserPos.x - ssrPos.x)).toBeLessThan(0.5);
    });
  });

  describe('Rotation calculation consistency', () => {
    it('should have 0 rotation on straight sections', () => {
      // Start of path (left rail)
      const startPos = getPositionOnPath(0);
      expect(Math.abs(startPos.rotation)).toBeLessThan(5); // Allow small tolerance

      // End of path (right rail)
      const endPos = getPositionOnPath(1);
      expect(Math.abs(endPos.rotation)).toBeLessThan(5);
    });

    it('should have consistent rotation in arc section', () => {
      // Test points in the arc
      const arcPoints = [0.4, 0.45, 0.5, 0.55, 0.6];

      arcPoints.forEach((progress) => {
        const browserPos = getPositionOnPath(progress);

        const originalDocument = global.document;
        // @ts-expect-error - intentionally simulating SSR
        delete global.document;
        resetCache();
        const ssrPos = getPositionOnPath(progress);
        global.document = originalDocument;
        resetCache();

        // Rotation should match between methods
        const rotationDiff = Math.abs(browserPos.rotation - ssrPos.rotation);
        expect(rotationDiff).toBeLessThan(2); // Allow 2 degree tolerance for arc
      });
    });
  });

  describe('Diagnostic: Rotation value comparison', () => {
    it('should output rotation values from both methods for analysis', () => {
      const testPoints = [0, 0.25, 0.4, 0.45, 0.5, 0.55, 0.6, 0.75, 1.0];

      console.log('\n=== Rotation Diagnostic Output ===');
      testPoints.forEach((progress) => {
        const browserPos = getPositionOnPath(progress);

        const originalDocument = global.document;
        // @ts-expect-error - intentionally simulating SSR
        delete global.document;
        resetCache(); // Clear cache before SSR test
        const ssrPos = getPositionOnPath(progress);
        global.document = originalDocument;
        resetCache(); // Clear cache after SSR test

        const diff = Math.abs(browserPos.rotation - ssrPos.rotation);
        console.log(
          `Progress ${progress.toFixed(2)}: ` +
          `Browser=${browserPos.rotation.toFixed(2)}°, ` +
          `SSR=${ssrPos.rotation.toFixed(2)}°, ` +
          `Diff=${diff.toFixed(2)}°`
        );

        // Still verify they're close
        expect(diff).toBeLessThan(2);
      });
      console.log('==================================\n');
    });
  });

  describe('Arc center position accuracy', () => {
    it('should position pills at exactly x=180 at the center of the arc', () => {
      // At progress = 0.5, we're at the bottom center of the arc
      const centerPos = getPositionOnPath(0.5);

      // Should be at x = 180 (arcCenterX)
      expect(Math.abs(centerPos.x - 180)).toBeLessThan(0.5);
    });
  });
});
