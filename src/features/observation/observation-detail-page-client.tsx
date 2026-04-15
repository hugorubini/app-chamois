"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getStoredObservations } from "../../lib/storage/observations-storage";
import { getArchivedObservations } from "../../lib/storage/archived-observations-storage";
import { getManyPhotos } from "../../lib/storage/photo-storage";
import type { Observation } from "../../types/observation";

function getCollarLabel(value: Observation["collarPresence"]) {
  if (value === "yes") return "Oui";
  if (value === "no") return "Non";
  return "Inconnu";
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

export default function ObservationDetailPageClient() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = typeof params.id === "string" ? params.id : "";
  const returnTo = searchParams.get("returnTo") ?? "map";

  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);

  const { observation, isArchived } = useMemo(() => {
    const storedObservations = getStoredObservations();
    const archivedObservations = getArchivedObservations();

    const pendingMatch = storedObservations.find((item) => item.id === id);
    if (pendingMatch) {
      return {
        observation: pendingMatch,
        isArchived: false,
      };
    }

    const archivedMatch = archivedObservations.find((item) => item.id === id);
    if (archivedMatch) {
      return {
        observation: archivedMatch,
        isArchived: true,
      };
    }

    return {
      observation: null,
      isArchived: false,
    };
  }, [id]);

  useEffect(() => {
    let isCancelled = false;

    async function loadPhotos() {
      if (!observation || !observation.photoIds || observation.photoIds.length === 0) {
        setPhotoUrls([]);
        return;
      }

      try {
        setPhotosLoading(true);
        const urls = await getManyPhotos(observation.photoIds);

        if (!isCancelled) {
          setPhotoUrls(urls);
        }
      } catch (error) {
        console.error("Impossible de charger les photos de l’observation :", error);
        if (!isCancelled) {
          setPhotoUrls([]);
        }
      } finally {
        if (!isCancelled) {
          setPhotosLoading(false);
        }
      }
    }

    loadPhotos();

    return () => {
      isCancelled = true;
    };
  }, [observation]);

  const backHref =
    returnTo === "observations"
      ? "/observations"
      : returnTo === "all-observations"
      ? "/all-observations"
      : "/map";

  if (!observation) {
    return (
      <main className="min-h-screen bg-neutral-100 px-4 py-6 text-neutral-900">
        <div className="mx-auto max-w-md space-y-4">
          <Link
            href={backHref}
            className="inline-flex rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 shadow-sm"
          >
            ← Retour
          </Link>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h1 className="text-lg font-semibold">Observation introuvable</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Cette donnée n’a pas été trouvée dans les observations locales ou dans l’historique.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-6 text-neutral-900">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={backHref}
            className="inline-flex rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 shadow-sm"
          >
            ← Retour
          </Link>

          <div
            className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
              isArchived
                ? "bg-neutral-200 text-neutral-700"
                : "bg-green-100 text-green-800"
            }`}
          >
            {isArchived ? "Archivée" : "À envoyer"}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h1 className="text-lg font-semibold">Détail de l’observation</h1>

          <div className="mt-4 space-y-3 text-sm">
            <p>
              <strong>Date :</strong> {observation.date}
            </p>
            <p>
              <strong>Heure :</strong> {observation.time}
            </p>
            <p>
              <strong>Latitude :</strong> {observation.latitude}
            </p>
            <p>
              <strong>Longitude :</strong> {observation.longitude}
            </p>
            <p>
              <strong>Chamois observés :</strong> {observation.numberOfAnimals}
            </p>
            <p>
              <strong>Certitude :</strong> {getCertaintyLabel(observation.certainty)}
            </p>
            <p>
              <strong>Type d’observation :</strong>{" "}
              {getObservationTypeLabel(observation.observationType)}
            </p>
            <p>
              <strong>Comportement :</strong> {getBehaviorLabel(observation.behavior)}
            </p>
            <p>
              <strong>Collier :</strong> {getCollarLabel(observation.collarPresence)}
            </p>

            {observation.collarNumbers && observation.collarNumbers.length > 0 && (
              <div>
                <strong>Numéros de colliers :</strong>
                <ul className="ml-5 mt-1 list-disc">
                  {observation.collarNumbers.map((number) => (
                    <li key={number}>{number}</li>
                  ))}
                </ul>
              </div>
            )}

            {observation.comment && observation.comment.trim() !== "" && (
              <p>
                <strong>Commentaire :</strong> {observation.comment}
              </p>
            )}

            {typeof observation.gpsAccuracy === "number" && (
              <p>
                <strong>Précision GPS :</strong> {observation.gpsAccuracy} m
              </p>
            )}
          </div>

          <div className="mt-5 border-t border-neutral-200 pt-4">
            <h2 className="text-sm font-semibold text-neutral-900">Photos</h2>

            {photosLoading && (
              <p className="mt-3 text-sm text-neutral-600">Chargement des photos...</p>
            )}

            {!photosLoading && photoUrls.length === 0 && (
              <p className="mt-3 text-sm text-neutral-600">
                Aucune photo enregistrée pour cette observation.
              </p>
            )}

            {!photosLoading && photoUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-1 gap-3">
                {photoUrls.map((photoUrl, index) => (
                  <img
                    key={`${photoUrl}-${index}`}
                    src={photoUrl}
                    alt={`Photo de l’observation ${index + 1}`}
                    className="w-full rounded-xl border border-neutral-200 object-cover shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>

          {!isArchived && (
            <div className="mt-5 pt-4">
              <Link
                href={`/report?id=${observation.id}&returnTo=${returnTo}`}
                className="inline-flex rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm"
              >
                Modifier la donnée
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}