import { NextResponse } from "next/server";
import { API_CONFIG } from "@/app/config/api.config";

/**
 * Train data tuple: [trainNumber, trainName, sourceStationCode, destinationStationCode]
 */
type TrainTuple = [string, string, string, string];

interface CacheMetadata {
  data: TrainTuple[];
  timestamp: number;
}

// Server-side cache for all trains data
let cache: CacheMetadata | null = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

/**
 * Check if cache is still valid
 */
function isCacheValid(): boolean {
  if (!cache) return false;
  return Date.now() - cache.timestamp < CACHE_DURATION_MS;
}

/**
 * Fetch all trains from RailRadar API
 */
async function fetchAllTrainsFromAPI(): Promise<TrainTuple[]> {
  const apiUrl = `https://api.railradar.org/api/v2/trains/all-trains?apiKey=${API_CONFIG.apiKey}`;

  const response = await fetch(apiUrl, {
    next: { revalidate: 3600 }, // Next.js cache for 1 hour
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

/**
 * GET /api/search/all
 * Returns all trains data with server-side caching
 */
export async function GET() {
  // Validate API key
  if (!API_CONFIG.apiKey) {
    return NextResponse.json(
      { success: false, error: "Missing API key" },
      { status: 500 },
    );
  }

  try {
    // Return cached data if valid
    if (isCacheValid() && cache) {
      return NextResponse.json({
        success: true,
        data: cache.data,
        cached: true,
        count: cache.data.length,
      });
    }

    // Fetch fresh data
    const trains = await fetchAllTrainsFromAPI();

    // Update cache
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
