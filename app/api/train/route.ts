import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/app/config/api.config";

function buildExternalApiUrl(
  trainNumber: string,
  journeyDate?: string,
): string {
  const baseUrl = `${API_CONFIG.baseURL}/trains/${trainNumber}`;
  return journeyDate ? `${baseUrl}?journeyDate=${journeyDate}` : baseUrl;
}

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

  if (!API_CONFIG.apiKey) {
    return createErrorResponse("API configuration error: Missing API key", 500);
  }

  const apiUrl = buildExternalApiUrl(trainNumber, journeyDate);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "X-API-Key": API_CONFIG.apiKey,
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
    return createErrorResponse("Failed to fetch train data", 500);
  }
}
