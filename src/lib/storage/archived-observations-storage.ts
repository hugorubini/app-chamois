import type { Observation } from "../../types/observation";

const ARCHIVE_STORAGE_KEY = "chamois-observations-archive";

export function getArchivedObservations(): Observation[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(ARCHIVE_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as Observation[];
  } catch {
    return [];
  }
}

export function saveArchivedObservations(observations: Observation[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    ARCHIVE_STORAGE_KEY,
    JSON.stringify(observations)
  );
}

export function addArchivedObservations(observationsToAdd: Observation[]) {
  const existingArchivedObservations = getArchivedObservations();

  const merged = [...observationsToAdd, ...existingArchivedObservations];

  saveArchivedObservations(merged);
}