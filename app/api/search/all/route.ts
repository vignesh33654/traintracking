import { NextResponse } from "next/server";
import { CACHE_DURATIONS } from "@/app/config/refetch.config";

type TrainTuple = [string, string, string, string];

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
  const apiUrl = `https://api.railradar.org/api/v1/trains/all-trains?apiKey=${apiKey}`;

  const response = await fetch(apiUrl, {
    next: { revalidate: CACHE_DURATIONS.SEARCH_SERVER / 1000 },
  });

  if (!response.ok) {
    throw new Error(`RailRadar API error: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid API response format");
  }

  return result.data;
}

export async function GET() {
  // Read environment variable directly in the route handler (Next.js App Router best practice)
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
