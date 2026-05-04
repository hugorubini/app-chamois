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

export type ObservationSex = "male" | "female" | "unknown";
export type ObservationAgeClass = "adult" | "young" | "kid" | "unknown";
export type ObservationHasKid = "yes" | "no" | "unknown";
export type ObservationBodyCondition =
  | "normal"
  | "thin"
  | "injured"
  | "other"
  | "unknown";
export type ObservationDisturbance =
  | "none"
  | "dog"
  | "car"
  | "human"
  | "other"
  | "unknown";

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
  sex?: ObservationSex;
  ageClass?: ObservationAgeClass;
  hasKid?: ObservationHasKid;
  bodyCondition?: ObservationBodyCondition;
  disturbance?: ObservationDisturbance;
  healthComment?: string;
  photoIds?: string[];
  syncStatus: "pending" | "sent" | "error";
}