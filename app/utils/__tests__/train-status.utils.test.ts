import { describe, expect, it } from "vitest";
import { getStatusMessage } from "../train-status.utils";
import type { RouteStation } from "@/app/types/train.types";

const route = [
  {
    sequence: 1,
    stationCode: "SJPR",
    stationName: "Suryapur",
    distanceFromSourceKm: 0,
  },
  {
    sequence: 2,
    stationCode: "GCN",
    stationName: "Gocharan",
    distanceFromSourceKm: 15,
  },
  {
    sequence: 3,
    stationCode: "HGA",
    stationName: "Hogla",
    distanceFromSourceKm: 27,
  },
] as RouteStation[];

describe("getStatusMessage", () => {
  it("does not show not started after the train has moved from origin", () => {
    expect(
      getStatusMessage({
        currentLocationStatus: "UNKNOWN",
        distanceFromLastStationKm: 0,
        distanceFromOriginKm: 15,
        currentStationCode: "GCN",
        currentSequence: 2,
        route,
        destinationStationCode: "HGA",
      }),
    ).toBe("12 KM TO Hogla");
  });

  it("uses the current station when distance is unavailable", () => {
    expect(
      getStatusMessage({
        currentLocationStatus: "UNKNOWN",
        distanceFromLastStationKm: 0,
        distanceFromOriginKm: 0,
        currentStationCode: "GCN",
        currentSequence: 2,
        route,
        destinationStationCode: "HGA",
      }),
    ).toBe("12 KM TO Hogla");
  });
});
