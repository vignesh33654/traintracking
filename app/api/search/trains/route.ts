import { NextRequest, NextResponse } from "next/server";

/**
 * DEPRECATED: Use /api/search/all + client-side filtering instead
 * This endpoint is kept for backward compatibility
 *
 * TODO: Remove this endpoint once all clients migrate to client-side search
 */

type TrainTuple = [string, string, string, string];

interface CacheMetadata {
  data: TrainTuple[];
  timestamp: number;
}

// Server-side cache shared with /api/search/all
let cache: CacheMetadata | null = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ message, status }, { status });
}

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
async function getAllTrains(apiKey: string): Promise<TrainTuple[]> {
  // Return cached data if valid
  if (isCacheValid() && cache) {
    return cache.data;
  }

  // Fetch fresh data
  const apiUrl = `https://api.railradar.org/api/v1/trains/all-trains?apiKey=${apiKey}`;
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const result = await response.json();

  if (result.success && Array.isArray(result.data)) {
    cache = {
      data: result.data,
      timestamp: Date.now(),
    };
    return result.data;
  }

  throw new Error("Invalid API response format");
}

/**
 * GET /api/search/trains?query=...
 * Server-side search with filtering
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("query");

  if (!query || query.length < 2) {
    return createErrorResponse(
      "Search query must be at least 2 characters",
      400,
    );
  }

  // Read environment variable directly in the route handler (Next.js App Router best practice)
  const apiKey = process.env.RAIL_RADAR_API_KEY;

  if (!apiKey) {
    return createErrorResponse("API configuration error: Missing API key", 500);
  }

  try {
    const allTrains = await getAllTrains(apiKey);

    // Server-side filtering
    const queryLower = query.toLowerCase();
    const filteredTrains = allTrains.filter(([number, name, from, to]) => {
      return (
        number.toLowerCase().includes(queryLower) ||
        name.toLowerCase().includes(queryLower) ||
        from.toLowerCase().includes(queryLower) ||
        to.toLowerCase().includes(queryLower)
      );
    });

    // Transform to response format
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
