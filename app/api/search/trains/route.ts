import { NextRequest, NextResponse } from "next/server";
import {
  buildLookupTrainsUrl,
  getRailRadarAuthHeaders,
  normalizeLookupTrainsData,
  parseRailRadarResponse,
  type TrainTuple,
} from "@/app/lib/railradar-api";

/**
 * DEPRECATED: Use /api/search/all + client-side filtering instead
 *
 * TODO: Remove this endpoint once all clients migrate to client-side search
 */

interface CacheMetadata {
  data: TrainTuple[];
  timestamp: number;
}

let cache: CacheMetadata | null = null;
const CACHE_DURATION_MS = 60 * 60 * 1000;

function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ message, status }, { status });
}

function isCacheValid(): boolean {
  if (!cache) return false;
  return Date.now() - cache.timestamp < CACHE_DURATION_MS;
}

async function getAllTrains(apiKey: string): Promise<TrainTuple[]> {
  if (isCacheValid() && cache) {
    return cache.data;
  }

  const response = await fetch(buildLookupTrainsUrl(), {
    headers: getRailRadarAuthHeaders(apiKey),
  });

  const data = await parseRailRadarResponse<unknown>(response);
  const trains = normalizeLookupTrainsData(data);

  if (trains.length === 0) {
    throw new Error("Invalid API response format");
  }

  cache = {
    data: trains,
    timestamp: Date.now(),
  };

  return trains;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("query");

  if (!query || query.length < 2) {
    return createErrorResponse(
      "Search query must be at least 2 characters",
      400,
    );
  }

  const apiKey = process.env.RAIL_RADAR_API_KEY;

  if (!apiKey) {
    return createErrorResponse("API configuration error: Missing API key", 500);
  }

  try {
    const allTrains = await getAllTrains(apiKey);
    const queryLower = query.toLowerCase();

    const filteredTrains = allTrains.filter(([number, name, from, to]) => {
      return (
        number.toLowerCase().includes(queryLower) ||
        name.toLowerCase().includes(queryLower) ||
        from.toLowerCase().includes(queryLower) ||
        to.toLowerCase().includes(queryLower)
      );
    });

    const results = filteredTrains.map(([number, name, from, to]) => ({
      trainNumber: number,
      trainName: name,
      sourceStationCode: from,
      destinationStationCode: to,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search trains error:", error);
    return createErrorResponse("Failed to search trains", 500);
  }
}
