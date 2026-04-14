import { appConfig } from "../config";
import type { Observation } from "../../types/observation";

export type SendObservationsResult = {
  success: boolean;
  sentCount: number;
  message?: string;
};

export async function sendObservations(
  observations: Observation[],
): Promise<SendObservationsResult> {
  if (appConfig.sendMode === "local-test") {
    const response = await fetch("/api/send-observations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        observations,
      }),
    });

    let data: unknown = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const errorMessage =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof data.error === "string"
          ? data.error
          : "Échec de l'envoi des observations.";

      throw new Error(errorMessage);
    }

    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : undefined;

    return {
      success: true,
      sentCount: observations.length,
      message,
    };
  }

  throw new Error("Le mode federation-api n'est pas encore configuré.");
}