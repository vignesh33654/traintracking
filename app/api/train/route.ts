import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/app/config/api.config';
import { getMockTrainData } from '@/app/api/mockTrainData';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const trainNumber = searchParams.get('trainNumber');
  const journeyDate = searchParams.get('journeyDate') || '';

  if (!trainNumber) {
    return NextResponse.json(
      { message: 'Train number is required' },
      { status: 400 }
    );
  }

  if (API_CONFIG.useMockAPI) {
    const mockData = getMockTrainData(trainNumber);
    if (mockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json(mockData);
    }
    return NextResponse.json(
      { message: 'Train not found in mock data' },
      { status: 404 }
    );
  }

  let apiUrl = `${API_CONFIG.baseURL}/trains/${trainNumber}`;
  if (journeyDate) {
    apiUrl += `?journeyDate=${journeyDate}`;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': API_CONFIG.apiKey,
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = JSON.parse(responseText);
      } catch {}
      return NextResponse.json(
        { 
          message: (errorData as { message?: string }).message || `API Error: ${response.status}`, 
          status: response.status,
        },
        { status: response.status }
      );
    }

    const responseData = JSON.parse(responseText);
    if (responseData.success && responseData.data) {
      return NextResponse.json(responseData.data);
    }
    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch train data', status: 500 },
      { status: 500 }
    );
  }
}

