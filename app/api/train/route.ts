import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/app/config/api.config';

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

  const apiUrl = `${API_CONFIG.baseURL}/trains/${trainNumber}${journeyDate ? `?journeyDate=${journeyDate}` : ''}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': API_CONFIG.apiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          message: errorData.message || `API Error: ${response.status}`, 
          status: response.status,
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    return NextResponse.json(responseData.success ? responseData.data : responseData);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch train data', status: 500 },
      { status: 500 }
    );
  }
}

