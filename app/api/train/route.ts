import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG, SERVER_API_CONFIG } from '@/app/config/api.config';

// Import mock data - only used when USE_MOCK_DATA is true
let mockTrainData: any = null;
if (process.env.USE_MOCK_DATA === 'true') {
  mockTrainData = require('./mock-train-data.json');
}

function buildExternalApiUrl(trainNumber: string, journeyDate?: string): string {
  const baseUrl = `${API_CONFIG.baseURL}/trains/${trainNumber}`;
  return journeyDate ? `${baseUrl}?journeyDate=${journeyDate}` : baseUrl;
}

function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ message, status }, { status });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const trainNumber = searchParams.get('trainNumber');
  const journeyDate = searchParams.get('journeyDate') || '';

  if (!trainNumber) {
    return createErrorResponse('Train number is required', 400);
  }

  // MOCK MODE: Return mock data without making API calls
  if (process.env.USE_MOCK_DATA === 'true') {
    // Optional: simulate API delay for realistic testing
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json(mockTrainData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // REAL API MODE: Make actual API calls
  if (!SERVER_API_CONFIG.apiKey) {
    return createErrorResponse('API configuration error: Missing API key', 500);
  }

  const apiUrl = buildExternalApiUrl(trainNumber, journeyDate);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'X-API-Key': SERVER_API_CONFIG.apiKey,
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
    return createErrorResponse('Failed to fetch train data', 500);
  }
}
