import { NextResponse } from "next/server";
import { CACHE_DURATIONS } from "@/app/config/refetch.config";
import {
  buildLookupTrainsUrl,
  getRailRadarAuthHeaders,
  normalizeLookupTrainsData,
  parseRailRadarResponse,
  type TrainTuple,
} from "@/app/lib/railradar-api";

interface CacheMetadata {
  data: TrainTuple[];
  timestamp: number;
}

let cache: CacheMetadata | null = null;

function isCacheValid(): boolean {
  if (!cache) return false;
  return Date.now() - cache.timestamp < CACHE_DURATIONS.SEARCH_SERVER;
}

async function fetchAllTrainsFromAPI(apiKey: string): Promise<TrainTuple[]> {
  const response = await fetch(buildLookupTrainsUrl(), {
    headers: getRailRadarAuthHeaders(apiKey),
    next: { revalidate: CACHE_DURATIONS.SEARCH_SERVER / 1000 },
  });

  const data = await parseRailRadarResponse<unknown>(response);
  const trains = normalizeLookupTrainsData(data);

  if (trains.length === 0) {
    throw new Error("Invalid API response format");
  }

  return trains;
}

export async function GET() {
  const apiKey = process.env.RAIL_RADAR_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "Missing API key" },
      { status: 500 },
    );
  }

  try {
    if (isCacheValid() && cache) {
      return NextResponse.json({
        success: true,
        data: cache.data,
        cached: true,
        count: cache.data.length,
      });
    }

    const trains = await fetchAllTrainsFromAPI(apiKey);

    cache = {
      data: trains,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      success: true,
      data: trains,
      cached: false,
      count: trains.length,
    });
  } catch (error) {
    console.error("Failed to fetch all trains:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch trains",
      },
      { status: 500 },
    );
  }
}
