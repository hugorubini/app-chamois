"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getStoredObservations } from "../../lib/storage/observations-storage";
import type { Observation } from "../../types/observation";
import { getArchivedObservations } from "../../lib/storage/archived-observations-storage";

const MapView = dynamic(() => import("./map-view").then((mod) => mod.MapView), {
  ssr: false,
});

const DEFAULT_CENTER: [number, number] = [44.7, 4.4];

export function MapScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlLat = searchParams.get("lat");
  const urlLng = searchParams.get("lng");
  const editingObservationId = searchParams.get("id");
  const isRepositionMode = Boolean(editingObservationId);

  const parsedLat = urlLat ? Number(urlLat) : NaN;
  const parsedLng = urlLng ? Number(urlLng) : NaN;

  const hasUrlCoordinates =
    Number.isFinite(parsedLat) && Number.isFinite(parsedLng);

  const initialCenter = useMemo<[number, number]>(() => {
    if (hasUrlCoordinates) {
      return [parsedLat, parsedLng];
    }
    return DEFAULT_CENTER;
  }, [hasUrlCoordinates, parsedLat, parsedLng]);

  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
  const [mapKey, setMapKey] = useState(0);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [archivedObservations, setArchivedObservations] = useState<Observation[]>([]);
  const [showArchivedObservations, setShowArchivedObservations] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const storedObservations = getStoredObservations();
    const storedArchivedObservations = getArchivedObservations();

    setObservations(storedObservations);
    setArchivedObservations(storedArchivedObservations);
  }, []);

  useEffect(() => {
    if (hasUrlCoordinates) {
      const nextCenter: [number, number] = [parsedLat, parsedLng];
      setMapCenter(nextCenter);
      setMapKey((prev) => prev + 1);
      return;
    }

    if (!navigator.geolocation) {
      setStatusMessage("La géolocalisation n’est pas disponible sur cet appareil.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextPosition: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setUserPosition(nextPosition);
        setMapCenter(nextPosition);
        setMapKey((prev) => prev + 1);
        setStatusMessage("");
      },
      (error) => {
        setStatusMessage(
          `Impossible de récupérer votre position au chargement. Code erreur : ${error.code}`
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, [hasUrlCoordinates, parsedLat, parsedLng]);

  const handleCenterChange = useCallback((position: [number, number]) => {
    setMapCenter(position);
  }, []);

  function handleLocateUser() {
    setStatusMessage("Récupération de votre position...");

    if (!navigator.geolocation) {
      setStatusMessage("La géolocalisation n’est pas disponible sur cet appareil.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextPosition: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setUserPosition(nextPosition);
        setMapCenter(nextPosition);
        setMapKey((prev) => prev + 1);
        setStatusMessage("Position récupérée avec succès.");
      },
      (error) => {
        setStatusMessage(
          `Impossible de récupérer votre position. Code erreur : ${error.code}`
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  function handlePlaceObservation() {
    const lat = mapCenter[0].toFixed(6);
    const lng = mapCenter[1].toFixed(6);

    const id = searchParams.get("id");
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const numberOfAnimals = searchParams.get("numberOfAnimals");
    const collarPresence = searchParams.get("collarPresence");
    const collarNumbers = searchParams.get("collarNumbers");
    const comment = searchParams.get("comment");

    const params = new URLSearchParams();
    params.set("lat", lat);
    params.set("lng", lng);

    if (id) params.set("id", id);
    if (date) params.set("date", date);
    if (time) params.set("time", time);
    if (numberOfAnimals) params.set("numberOfAnimals", numberOfAnimals);
    if (collarPresence) params.set("collarPresence", collarPresence);
    if (collarNumbers) params.set("collarNumbers", collarNumbers);
    if (comment) params.set("comment", comment);

    router.push(`/report?${params.toString()}`);
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-white text-neutral-900">
      <MapView
        key={mapKey}
        userPosition={userPosition}
        observations={observations}
        archivedObservations={archivedObservations}
        showArchivedObservations={showArchivedObservations}
        onCenterChange={handleCenterChange}
        initialCenter={mapCenter}
        initialZoom={isRepositionMode ? 16 : 13}
        editingObservationId={editingObservationId}
        fullScreen
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2000] px-4 pb-6 pt-4">
        <div className="pointer-events-auto mx-auto flex max-w-md items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 shadow-sm"
          >
            ← Accueil
          </Link>
        </div>

        {statusMessage && (
          <div className="pointer-events-auto mx-auto mt-3 max-w-md rounded-xl bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm">
            {statusMessage}
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2000] px-4 pb-6 pt-10">
        <div className="pointer-events-auto mx-auto flex max-w-md flex-col gap-3">
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => setShowArchivedObservations((prev) => !prev)}
              className="rounded-lg bg-white/70 px-2.5 py-1.5 text-[11px] font-medium text-neutral-900 shadow-sm"
            >
              {showArchivedObservations
                ? "Masquer l’historique"
                : "Afficher l’historique"}
            </button>

            <div className="rounded-lg bg-white/70 px-2.5 py-1.5 text-right text-[11px] text-neutral-600 shadow-sm">
              {mapCenter[0].toFixed(5)}, {mapCenter[1].toFixed(5)}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLocateUser}
            className="w-full rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-neutral-900 shadow-sm"
          >
            Me géolocaliser
          </button>

          <button
            type="button"
            onClick={handlePlaceObservation}
            className="w-full rounded-2xl bg-black px-4 py-4 text-sm font-semibold text-white shadow-sm"
          >
            {isRepositionMode ? "Replacer le point" : "Placer une donnée"}
          </button>
        </div>
      </div>
    </main>
  );
}