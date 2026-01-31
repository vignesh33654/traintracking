export interface TrainSearchResult {
  trainNumber: string;
  trainName: string;
  sourceStationCode: string;
  destinationStationCode: string;
}

export type TrainSearchResponse = TrainSearchResult[];
