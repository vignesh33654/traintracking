import { describe, it, expect } from "vitest";
import {
  isTrainRunningStatus,
  getInitialStationIndex,
} from "../train-auto-scroll";

// ─── isTrainRunningStatus ────────────────────────────────────────────
describe("isTrainRunningStatus", () => {
  it('should return true for "AT_STATION"', () => {
    expect(isTrainRunningStatus("AT_STATION")).toBe(true);
  });

  it('should return true for "ARRIVED"', () => {
    expect(isTrainRunningStatus("ARRIVED")).toBe(true);
  });

  it('should return true for "DEPARTED"', () => {
    expect(isTrainRunningStatus("DEPARTED")).toBe(true);
  });

  it('should return false for "CANCELLED"', () => {
    expect(isTrainRunningStatus("CANCELLED")).toBe(false);
  });

  it('should return false for "UNKNOWN"', () => {
    expect(isTrainRunningStatus("UNKNOWN")).toBe(false);
  });

  it("should return false for null", () => {
    expect(isTrainRunningStatus(null)).toBe(false);
  });
});

// ─── getInitialStationIndex ──────────────────────────────────────────
describe("getInitialStationIndex", () => {
  it("should return sequence - 1 when train is running and sequence is provided", () => {
    expect(getInitialStationIndex(true, 5)).toBe(4);
    expect(getInitialStationIndex(true, 1)).toBe(0);
    expect(getInitialStationIndex(true, 10)).toBe(9);
  });

  it("should return 0 when train is not running", () => {
    expect(getInitialStationIndex(false, 5)).toBe(0);
    expect(getInitialStationIndex(false, null)).toBe(0);
  });

  it("should return 0 when sequence is null", () => {
    expect(getInitialStationIndex(true, null)).toBe(0);
  });

  it("should return 0 when sequence is 0 (falsy)", () => {
    expect(getInitialStationIndex(true, 0)).toBe(0);
  });
});
