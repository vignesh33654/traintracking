import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/app/config/api.config";

function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ message, status }, { status });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const trainNumber = searchParams.get("trainNumber");

  if (!trainNumber) {
    return createErrorResponse("Train number is required", 400);
  }

  const apiKey = process.env.RAIL_RADAR_API_KEY;

  if (!apiKey) {
    return createErrorResponse("API configuration error: Missing API key", 500);
  }

  const apiUrl = `${API_CONFIG.baseURL}/trains/${trainNumber}/average-delay`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "X-API-Key": apiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `API Error: ${response.status}`;
      return createErrorResponse(message, response.status);
    }

    const data = await response.json();
    return NextResponse.json(data.success ? data.data : data);
  } catch {
    return createErrorResponse("Failed to fetch average delay data", 500);
  }
}
