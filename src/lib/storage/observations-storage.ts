import type { Observation } from "../../types/observation";

const STORAGE_KEY = "chamois-observations";

export function getStoredObservations(): Observation[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as Observation[];
  } catch {
    return [];
  }
}

export function saveObservation(observation: Observation): void {
  const existingObservations = getStoredObservations();
  const updatedObservations = [observation, ...existingObservations];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedObservations));
}

export function updateObservation(updatedObservation: Observation): void {
  const existingObservations = getStoredObservations();

  const nextObservations = existingObservations.map((observation) =>
    observation.id === updatedObservation.id ? updatedObservation : observation
  );

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextObservations));
}

export function getObservationById(id: string): Observation | undefined {
  const existingObservations = getStoredObservations();
  return existingObservations.find((observation) => observation.id === id);
}

export function clearStoredObservations(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}