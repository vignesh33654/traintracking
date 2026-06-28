import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusDot } from "../StatusDot";
import { getTodayDate } from "@/app/utils/todaydate";
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
] as RouteStation[];

describe("StatusDot", () => {
  it("shows running state when train is at an intermediate station", () => {
    const { container } = render(
      <StatusDot
        journeyDate={getTodayDate()}
        distanceFromOriginKm={0}
        currentStationCode="GCN"
        currentSequence={2}
        route={route}
      />,
    );

    const dot = container.querySelector("span span:last-child");
    expect(dot).toHaveClass("bg-green");
  });
});
