export type CollarPresence = "yes" | "no" | "unknown";
export type ObservationCertainty = "certain" | "probable" | "doubtful";
export type ObservationType =
  | "visual"
  | "auditory"
  | "olfactory"
  | "droppings"
  | "other";
export type ObservationBehavior =
  | "movement"
  | "feeding"
  | "rest"
  | "flight"
  | "other";

export interface Observation {
  id: string;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  gpsAccuracy?: number;
  numberOfAnimals: number;
  collarPresence: CollarPresence;
  collarNumbers?: string[];
  comment?: string;
  certainty: ObservationCertainty;
  observationType: ObservationType;
  behavior: ObservationBehavior;
  photoIds?: string[];
  syncStatus: "pending" | "sent" | "error";
}