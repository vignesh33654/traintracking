export interface Station {
  id: string;
  name: string;
  order: number;
}

export interface TrainPosition {
  currentStationId: string;
  progress: number;
}

export interface RailApiResponse {
  stations: Station[];
  itemsPerSegment: number;
  trainPosition?: TrainPosition;
}

const MOCK_STATIONS: Station[] = [
  { id: "1", name: "Central Station", order: 0 },
  { id: "2", name: "North Terminal", order: 1 },
  { id: "3", name: "East Junction", order: 2 },
  { id: "4", name: "South Bay", order: 3 },
  { id: "5", name: "West Plaza", order: 4 },
  { id: "6", name: "Downtown", order: 5 },
  { id: "7", name: "Airport", order: 6 },
  { id: "8", name: "Harbor View", order: 7 },
  { id: "9", name: "University", order: 8 },
  { id: "10", name: "Tech Park", order: 9 },
  { id: "11", name: "Medical Center", order: 10 },
  { id: "12", name: "Sports Arena", order: 11 },
  { id: "13", name: "Convention Center", order: 12 },
  { id: "14", name: "Museum District", order: 13 },
  { id: "15", name: "Financial District", order: 14 },
  { id: "16", name: "Old Town", order: 15 },
  { id: "17", name: "Riverside", order: 16 },
  { id: "18", name: "Hillside", order: 17 },
  { id: "19", name: "Lakefront", order: 18 },
  { id: "20", name: "Parkway", order: 19 },
  { id: "21", name: "Market Square", order: 20 },
  { id: "22", name: "Industrial Zone", order: 21 },
  { id: "23", name: "Residential Park", order: 22 },
  { id: "24", name: "Shopping Mall", order: 23 },
  { id: "25", name: "End Terminal", order: 24 },
];

export async function fetchRailData(): Promise<RailApiResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return {
    stations: MOCK_STATIONS,
    itemsPerSegment: 5,
    trainPosition: {
      currentStationId: "3",
      progress: 0.4,
    },
  };
}

export async function fetchTrainPosition(): Promise<TrainPosition> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  const randomStation = Math.floor(Math.random() * MOCK_STATIONS.length);
  const randomProgress = Math.random();
  
  return {
    currentStationId: MOCK_STATIONS[randomStation].id,
    progress: randomProgress,
  };
}

