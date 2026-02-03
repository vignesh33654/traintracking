import { NextRequest, NextResponse } from "next/server";
import mockTrainData from "./mock-train-data.json";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const trainNumber = searchParams.get("trainNumber");

  // Optional: simulate API delay for realistic testing
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!trainNumber) {
    return NextResponse.json(
      { error: "Train number is required" },
      { status: 400 }
    );
  }

  // Return mock data for any train number
  // You can customize the response based on trainNumber if needed
  return NextResponse.json(mockTrainData, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
