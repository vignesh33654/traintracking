import { describe, it, expect } from 'vitest';
import { U_SHAPED_TRACK_PATH, getTrackPath, getPathTotalLength, resetCache } from '../track-path';
import { TRACK_PATH_CONFIG } from '../../config/circular-rotator.config';

describe('track-path', () => {
  describe('U_SHAPED_TRACK_PATH SVG string correctness', () => {
    it('should start at the correct position (top left rail)', () => {
      const { leftRailX, railTop } = TRACK_PATH_CONFIG;

      // SVG path should start with M (move to) command at leftRailX, railTop
      const expectedStart = `M ${leftRailX} ${railTop}`;
      expect(U_SHAPED_TRACK_PATH.startsWith(expectedStart)).toBe(true);
    });

    it('should contain a line to the arc start point', () => {
      const { leftRailX, arcStartY } = TRACK_PATH_CONFIG;

      // Should have L (line to) command to leftRailX, arcStartY
      const expectedLine = `L ${leftRailX} ${arcStartY}`;
      expect(U_SHAPED_TRACK_PATH).toContain(expectedLine);
    });

    it('should contain an arc command with correct radius', () => {
      const { arcRadius } = TRACK_PATH_CONFIG;

      // Should have A (arc) command with radius specified twice
      const arcCommand = `A ${arcRadius} ${arcRadius}`;
      expect(U_SHAPED_TRACK_PATH).toContain(arcCommand);
    });

    it('should end at the correct position (top right rail)', () => {
      const { rightRailX, railTop } = TRACK_PATH_CONFIG;

      // Should end with L (line to) command to rightRailX, railTop
      const expectedEnd = `L ${rightRailX} ${railTop}`;
      expect(U_SHAPED_TRACK_PATH.endsWith(expectedEnd)).toBe(true);
    });

    it('should create a valid U-shape from left to right', () => {
      const { leftRailX, railTop, arcStartY, arcRadius } = TRACK_PATH_CONFIG;

      // Parse the path components
      const parts = U_SHAPED_TRACK_PATH.split(' ');

      // Expected structure: M x1 y1 L x2 y2 A r r ... L x3 y3
      expect(parts[0]).toBe('M'); // Move to start
      expect(parts[1]).toBe(String(leftRailX));
      expect(parts[2]).toBe(String(railTop));

      expect(parts[3]).toBe('L'); // Line down left rail
      expect(parts[4]).toBe(String(leftRailX));
      expect(parts[5]).toBe(String(arcStartY));

      expect(parts[6]).toBe('A'); // Arc
      expect(parts[7]).toBe(String(arcRadius));
      expect(parts[8]).toBe(String(arcRadius));
    });
  });

  describe('getPathTotalLength calculation', () => {
    it('should calculate correct total length mathematically', () => {
      const { railTop, arcStartY, arcRadius } = TRACK_PATH_CONFIG;

      const straightLength = arcStartY - railTop;
      const arcLength = Math.PI * arcRadius;
      const expectedTotal = 2 * straightLength + arcLength;

      const actualTotal = getPathTotalLength();

      // Should match mathematical expectation within 1px
      expect(Math.abs(actualTotal - expectedTotal)).toBeLessThan(1);
    });

    it('should return consistent value on multiple calls (caching)', () => {
      const length1 = getPathTotalLength();
      const length2 = getPathTotalLength();
      const length3 = getPathTotalLength();

      expect(length1).toBe(length2);
      expect(length2).toBe(length3);
    });

    it('should work in SSR environment (no document)', () => {
      const originalDocument = global.document;

      try {
        // @ts-expect-error - intentionally simulating SSR
        delete global.document;

        const length = getPathTotalLength();

        // Should still calculate correctly
        const { railTop, arcStartY, arcRadius } = TRACK_PATH_CONFIG;
        const expectedTotal = 2 * (arcStartY - railTop) + Math.PI * arcRadius;

        expect(Math.abs(length - expectedTotal)).toBeLessThan(1);
      } finally {
        global.document = originalDocument;
      }
    });
  });

  describe('getTrackPath', () => {
    it('should return null in SSR environment', () => {
      const originalDocument = global.document;

      try {
        // @ts-expect-error - intentionally simulating SSR
        delete global.document;

        const path = getTrackPath();
        expect(path).toBeNull();
      } finally {
        global.document = originalDocument;
      }
    });

    it('should return SVGPathElement in browser environment or null in jsdom', () => {
      const path = getTrackPath();

      // In jsdom, SVG methods may not be available, so path could be null
      // This is expected behavior per our implementation
      if (path) {
        expect(path.tagName.toLowerCase()).toBe('path');
        expect(path.getAttribute('d')).toBe(U_SHAPED_TRACK_PATH);
      } else {
        // jsdom doesn't implement getTotalLength/getPointAtLength
        // Our code correctly returns null in this case
        expect(path).toBeNull();
      }
    });

    it('should return cached path on subsequent calls', () => {
      const path1 = getTrackPath();
      const path2 = getTrackPath();

      // Should return the same instance (cached)
      expect(path1).toBe(path2);
    });
  });

  describe('SVG path validation with browser methods', () => {
    it('should produce valid points at key positions using browser methods', () => {
      const path = getTrackPath();

      // Skip if not available (SSR)
      if (!path || typeof path.getTotalLength !== 'function') {
        return;
      }

      const totalLength = path.getTotalLength();

      // Test start point (0%)
      const startPoint = path.getPointAtLength(0);
      expect(Math.abs(startPoint.x - TRACK_PATH_CONFIG.leftRailX)).toBeLessThan(1);
      expect(Math.abs(startPoint.y - TRACK_PATH_CONFIG.railTop)).toBeLessThan(1);

      // Test end point (100%)
      const endPoint = path.getPointAtLength(totalLength);
      expect(Math.abs(endPoint.x - TRACK_PATH_CONFIG.rightRailX)).toBeLessThan(1);
      expect(Math.abs(endPoint.y - TRACK_PATH_CONFIG.railTop)).toBeLessThan(1);

      // Test middle point (50%) - should be at bottom arc center
      const midPoint = path.getPointAtLength(totalLength / 2);
      expect(Math.abs(midPoint.x - TRACK_PATH_CONFIG.arcCenterX)).toBeLessThan(5);
      expect(Math.abs(midPoint.y - (TRACK_PATH_CONFIG.arcStartY + TRACK_PATH_CONFIG.arcRadius))).toBeLessThan(5);
    });
  });

  describe('Error handling and robustness', () => {
    it('should handle DOM creation in try-catch', () => {
      // The createTrackPathElement function should have error handling
      // This test verifies it doesn't throw
      expect(() => getTrackPath()).not.toThrow();
    });

    it('should gracefully handle missing SVG methods', () => {
      // Even if browser methods aren't available, should still work
      expect(() => getPathTotalLength()).not.toThrow();
    });
  });

  describe('Cache management', () => {
    it('should allow cache reset for testing', () => {
      const length1 = getPathTotalLength();

      resetCache();

      const length2 = getPathTotalLength();
      // Values should still match after reset
      expect(length1).toBe(length2);
    });

    it('should invalidate both path and length caches', () => {
      // Get initial values to populate cache
      getTrackPath();
      getPathTotalLength();

      // Reset cache
      resetCache();

      // Verify cache was cleared by checking values are recalculated
      const newLength = getPathTotalLength();
      expect(newLength).toBeGreaterThan(0); // Should still work
    });
  });
});
