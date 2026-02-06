import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/app/config/api.config";

function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ message, status }, { status });
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

  if (!API_CONFIG.apiKey) {
    return createErrorResponse("API configuration error: Missing API key", 500);
  }

  const apiUrl = `${API_CONFIG.baseURL}/search/trains?query=${encodeURIComponent(query)}`;

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
    return createErrorResponse("Failed to search trains", 500);
  }
}
