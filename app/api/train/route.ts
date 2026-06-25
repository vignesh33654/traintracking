import { NextRequest, NextResponse } from "next/server";
import {
  buildLegacyTrainUrl,
  getRailRadarAuthHeaders,
  parseRailRadarResponse,
  RailRadarApiError,
} from "@/app/lib/railradar-api";

function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ message, status }, { status });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const trainNumber = searchParams.get("trainNumber");
  const journeyDate = searchParams.get("journeyDate") || "";

  if (!trainNumber) {
    return createErrorResponse("Train number is required", 400);
  }

  const apiKey = process.env.RAIL_RADAR_API_KEY;

  if (!apiKey) {
    return createErrorResponse("API configuration error: Missing API key", 500);
  }

  const apiUrl = buildLegacyTrainUrl(trainNumber, journeyDate || undefined);

  try {
    const response = await fetch(apiUrl, {
      headers: getRailRadarAuthHeaders(apiKey),
    });

    const data = await parseRailRadarResponse(response);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof RailRadarApiError) {
      return createErrorResponse(error.message, error.status);
    }

    return createErrorResponse("Failed to fetch train data", 500);
  }
}
