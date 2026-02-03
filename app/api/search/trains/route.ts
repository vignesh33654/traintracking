import { NextRequest, NextResponse } from "next/server";
import mockSearchData from "./mock-search-data.json";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  // Optional: simulate API delay for realistic testing
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    );
  }

  // Filter mock data based on query
  const filteredResults = mockSearchData.filter(
    (train) =>
      train.trainNumber.toLowerCase().includes(query.toLowerCase()) ||
      train.trainName.toLowerCase().includes(query.toLowerCase()) ||
      train.sourceStationCode.toLowerCase().includes(query.toLowerCase()) ||
      train.destinationStationCode.toLowerCase().includes(query.toLowerCase())
  );

  return NextResponse.json(filteredResults, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
