import { NextResponse } from "next/server";

/**
 * TEMPORARY: Debug endpoint to verify env vars on Vercel
 * DELETE this file after confirming env vars work
 */
export async function GET() {
  return NextResponse.json({
    hasRailRadarKey: !!process.env.RAIL_RADAR_API_KEY,
    keyLength: process.env.RAIL_RADAR_API_KEY?.length ?? 0,
    nodeEnv: process.env.NODE_ENV,
  });
}
