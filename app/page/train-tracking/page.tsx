"use client";

import CircularRotator from "@/app/components/ui/CircularRotator";
import { API_CONFIG } from "@/app/config/api.config";

export default function TrainTrackingPage() {
  return <CircularRotator trainNumber={API_CONFIG.trainNumber} />;
}

