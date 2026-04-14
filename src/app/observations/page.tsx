"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  deleteManyPhotos,
  getManyPhotos,
} from "../../lib/storage/photo-storage";
import { addArchivedObservations } from "../../lib/storage/archived-observations-storage";
import { sendObservations } from "../../lib/send/send-observations";
import {
  clearStoredObservations,
  getStoredObservations,
} from "../../lib/storage/observations-storage";
import type { Observation } from "../../types/observation";

const STORAGE_KEY = "chamois-observations";

function getCollarLabel(value: Observation["collarPresence"]) {
  if (value === "yes") return "Oui";
  if (value === "no") return "Non";
  return "Inconnu";
}

function getSyncStatusLabel(value: Observation["syncStatus"]) {
  if (value === "pending") return "À envoyer";
  if (value === "sent") return "Envoyée";
  return "Erreur";
}

function getCertaintyLabel(value: Observation["certainty"]) {
  if (value === "certain") return "Certain";
  if (value === "probable") return "Probable";
  return "Douteux";
}

function getObservationTypeLabel(value: Observation["observationType"]) {
  if (value === "visual") return "Visuel";
  if (value === "auditory") return "Contact auditif";
  if (value === "olfactory") return "Contact olfactif";
  if (value === "droppings") return "Crotte";
  return "Autre";
}

function getBehaviorLabel(value: Observation["behavior"]) {
  if (value === "movement") return "Déplacement";
  if (value === "feeding") return "Alimentation";
  if (value === "rest") return "Repos";
  if (value === "flight") return "Fuite";
  return "Autre";
}

function ObservationPhotos({ photoIds }: { photoIds?: string[] }) {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadPhotos() {
      if (!photoIds || photoIds.length === 0) {
        setPhotoUrls([]);
        return;
      }

      try {
        const urls = await getManyPhotos(photoIds);
        if (isMounted) {
          setPhotoUrls(urls);
        }
      } catch {
        if (isMounted) {
          setPhotoUrls([]);
        }
      }
    }

    loadPhotos();

    return () => {
      isMounted = false;
    };
  }, [photoIds]);

  if (photoUrls.length === 0) {
    return null;
  }

  return (
    <div>
      <p>Photos :</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {photoUrls.map((photoUrl, index) => (
          <img
            key={`${photoUrl}-${index}`}
            src={photoUrl}
            alt={`Photo observation ${index + 1}`}
            className="h-24 w-full rounded-lg object-cover"
          />
        ))}
      </div>
    </div>
  );
}

export default function ObservationsPage() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [sendStatusMessage, setSendStatusMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const storedObservations = getStoredObservations();
    const pendingObservations = storedObservations.filter(
      (observation) => observation.syncStatus !== "sent"
    );
    setObservations(pendingObservations);
  }, []);

  async function handleSendObservations() {
    if (observations.length === 0) {
      setSendStatusMessage("Aucune observation à envoyer.");
      return;
    }

    setIsSending(true);
    setSendStatusMessage("");

    try {
      const result = await sendObservations(observations);

      const sentObservations: Observation[] = observations.map((observation) => ({
        ...observation,
        syncStatus: "sent",
      }));

      addArchivedObservations(sentObservations);

      setObservations([]);
      clearStoredObservations();

      setSendStatusMessage(
        `${result.sentCount} observation(s) envoyée(s) et déplacée(s) dans l’historique.`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur inconnue pendant l’envoi.";
      setSendStatusMessage(`Impossible d’envoyer les données : ${message}`);
    } finally {
      setIsSending(false);
    }
  }

  async function handleDeleteObservation(id: string) {
    const observationToDelete = observations.find(
      (observation) => observation.id === id
    );

    if (observationToDelete?.photoIds && observationToDelete.photoIds.length > 0) {
      await deleteManyPhotos(observationToDelete.photoIds);
    }

    const updatedObservations = observations.filter(
      (observation) => observation.id !== id
    );

    setObservations(updatedObservations);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedObservations));
  }

  async function handleDeleteAllObservations() {
    const allPhotoIds = observations.flatMap(
      (observation) => observation.photoIds ?? []
    );

    if (allPhotoIds.length > 0) {
      await deleteManyPhotos(allPhotoIds);
    }

    setObservations([]);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <main className="min-h-screen bg-white px-6 py-8 text-neutral-900">
      <div className="mx-auto max-w-md">
        <div className="mb-4 space-y-3">
          <Link
            href="/"
            className="inline-flex w-fit rounded-xl border border-neutral-300 px-4 py-2 text-sm text-neutral-700"
          >
            ← Retour à l’accueil
          </Link>

          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-neutral-100 p-1">
            <Link
              href="/observations"
              className="rounded-xl bg-black px-4 py-3 text-center text-sm font-semibold text-white"
            >
              <span className="text-white">À envoyer</span>
            </Link>

            <Link
              href="/all-observations"
              className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-neutral-700"
            >
              Historique
            </Link>
          </div>
        </div>

        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          En attente
        </p>
        <h1 className="mt-2 text-3xl font-bold">Mes observations</h1>
        <p className="mt-4 text-base text-neutral-600">
          Retrouvez ici les signalements encore présents sur cet appareil et prêts à être envoyés.
        </p>

        {observations.length > 0 && (
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleSendObservations}
              disabled={isSending}
              className="w-full rounded-2xl bg-black px-4 py-4 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
            >
              {isSending ? "Envoi en cours..." : "Envoyer mes données"}
            </button>

            {sendStatusMessage && (
              <p className="rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
                {sendStatusMessage}
              </p>
            )}

            <button
              type="button"
              onClick={handleDeleteAllObservations}
              className="w-full rounded-2xl border border-red-300 px-4 py-3 text-sm font-medium text-red-700"
            >
              Tout supprimer
            </button>
          </div>
        )}

        {observations.length === 0 && sendStatusMessage && (
          <p className="mt-6 rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
            {sendStatusMessage}
          </p>
        )}

        <div className="mt-8 space-y-4">
          {observations.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 p-4 text-sm text-neutral-600">
              Aucune observation en attente d’envoi.
            </div>
          ) : (
            observations.map((observation) => (
              <article
                key={observation.id}
                className="rounded-2xl border border-neutral-200 p-4"
              >
                <p className="text-sm text-neutral-500">
                  {observation.date} à {observation.time}
                </p>

                <h2 className="mt-2 text-lg font-semibold">
                  {observation.numberOfAnimals} chamois observé
                  {observation.numberOfAnimals > 1 ? "s" : ""}
                </h2>

                <div className="mt-3 space-y-1 text-sm text-neutral-700">
                  <p>Latitude : {observation.latitude}</p>
                  <p>Longitude : {observation.longitude}</p>

                  {typeof observation.gpsAccuracy === "number" && (
                    <p>Précision GPS : {observation.gpsAccuracy} m</p>
                  )}

                  <p>Certitude : {getCertaintyLabel(observation.certainty)}</p>
                  <p>Type : {getObservationTypeLabel(observation.observationType)}</p>
                  <p>Comportement : {getBehaviorLabel(observation.behavior)}</p>
                  <p>Collier : {getCollarLabel(observation.collarPresence)}</p>
                  <p>Statut : {getSyncStatusLabel(observation.syncStatus)}</p>

                  {observation.collarPresence === "yes" &&
                    observation.collarNumbers &&
                    observation.collarNumbers.length > 0 && (
                      <div>
                        <p>Numéros des colliers :</p>
                        <ul className="ml-5 list-disc">
                          {observation.collarNumbers.map((number) => (
                            <li key={number}>{number}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {observation.comment && observation.comment.trim() !== "" && (
                    <div>
                      <p>Commentaire :</p>
                      <p className="text-neutral-600">{observation.comment}</p>
                    </div>
                  )}

                  <ObservationPhotos photoIds={observation.photoIds} />
                </div>

                <div className="mt-4 flex gap-3">
                  <Link
                    href={`/report?id=${observation.id}&returnTo=observations`}
                    className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-center text-sm font-medium text-neutral-900"
                  >
                    Modifier
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDeleteObservation(observation.id)}
                    className="flex-1 rounded-xl border border-red-300 px-4 py-3 text-sm font-medium text-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main >
  );
}