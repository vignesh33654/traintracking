import { API_CONFIG } from "@/app/config/api.config";

export type TrainTuple = [string, string, string, string];

export class RailRadarApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getRailRadarAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

export function buildLegacyTrainUrl(
  trainNumber: string,
  journeyDate?: string,
): string {
  const url = new URL(`${API_CONFIG.baseURL}/legacy/trains/${trainNumber}`);
  url.searchParams.set("dataType", "full");
  if (journeyDate) {
    url.searchParams.set("journeyDate", journeyDate);
  }
  return url.toString();
}

export function buildLookupTrainsUrl(): string {
  return `${API_CONFIG.baseURL}/lookup/trains`;
}

export function buildAverageDelayUrl(trainNumber: string): string {
  return `${API_CONFIG.baseURL}/legacy/trains/${trainNumber}/average-delay`;
}

export async function parseRailRadarResponse<T>(
  response: Response,
): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      (errorData as { message?: string }).message ||
      `API Error: ${response.status}`;
    throw new RailRadarApiError(message, response.status);
  }

  const result = await response.json();
  return (result.success ? result.data : result) as T;
}

// lookup/trains → [number, name, from, to] tuples for client-side search
export function normalizeLookupTrainsData(data: unknown): TrainTuple[] {
  if (Array.isArray(data)) {
    return data
      .map(normalizeTrainEntry)
      .filter((entry): entry is TrainTuple => entry !== null);
  }

  if (data && typeof data === "object") {
    return Object.entries(data as Record<string, unknown>).map(
      ([number, value]) => normalizeTrainMapEntry(number, value),
    );
  }

  return [];
}

function normalizeTrainMapEntry(
  number: string,
  value: unknown,
): TrainTuple {
  if (typeof value === "string") {
    return [number, value, "", ""];
  }

  if (value && typeof value === "object") {
    const train = value as Record<string, string>;
    return [
      number,
      train.name || train.trainName || String(value),
      train.sourceStationCode || train.from || "",
      train.destinationStationCode || train.to || "",
    ];
  }

  return [number, String(value), "", ""];
}

function normalizeTrainEntry(entry: unknown): TrainTuple | null {
  if (!Array.isArray(entry) || entry.length < 2) {
    return null;
  }

  return [
    String(entry[0]),
    String(entry[1]),
    String(entry[2] ?? ""),
    String(entry[3] ?? ""),
  ];
}
