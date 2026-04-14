"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { Observation } from "../../types/observation";

const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 18px;
      height: 18px;
      border-radius: 9999px;
      background: #2563eb;
      border: 3px solid white;
      box-shadow: 0 0 0 2px #2563eb;
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const observationIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 18px;
      height: 18px;
      border-radius: 9999px;
      background: #dc2626;
      border: 3px solid white;
      box-shadow: 0 0 0 2px #dc2626;
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const editingObservationIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 22px;
      height: 22px;
      border-radius: 9999px;
      background: #f59e0b;
      border: 4px solid white;
      box-shadow: 0 0 0 2px #f59e0b;
    "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

type BaseMapKey = "plan" | "satellite" | "relief";

function MapSizeFixer() {
  const map = useMap();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isUnmounted = false;

    const refreshMapSize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        if (isUnmounted) return;

        try {
          const container = map.getContainer();

          if (!container || !container.isConnected) {
            return;
          }

          map.invalidateSize();
        } catch {
          // Ignore si Leaflet est déjà démonté
        }
      }, 300);
    };

    refreshMapSize();

    window.addEventListener("load", refreshMapSize);
    window.addEventListener("resize", refreshMapSize);
    window.addEventListener("orientationchange", refreshMapSize);

    return () => {
      isUnmounted = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      window.removeEventListener("load", refreshMapSize);
      window.removeEventListener("resize", refreshMapSize);
      window.removeEventListener("orientationchange", refreshMapSize);
    };
  }, [map]);

  return null;
}

function MapCenterTracker({
  onCenterChange,
}: {
  onCenterChange?: (position: [number, number]) => void;
}) {
  useMapEvents({
    moveend(event) {
      if (!onCenterChange) return;
      const center = event.target.getCenter();
      onCenterChange([center.lat, center.lng]);
    },
    zoomend(event) {
      if (!onCenterChange) return;
      const center = event.target.getCenter();
      onCenterChange([center.lat, center.lng]);
    },
  });

  return null;
}

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

function ObservationPopupContent({
  observation,
  isEditing,
}: {
  observation: Observation;
  isEditing: boolean;
}) {

  return (
    <div className="space-y-1 text-sm">
      {isEditing && (
        <p>
          <strong>Observation en cours de repositionnement</strong>
        </p>
      )}

      <p>
        <strong>Date :</strong> {observation.date} à {observation.time}
      </p>
      <p>
        <strong>Chamois observés :</strong> {observation.numberOfAnimals}
      </p>
      <p>
        <strong>Certitude :</strong> {getCertaintyLabel(observation.certainty)}
      </p>
      <p>
        <strong>Type :</strong>{" "}
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
          <strong>Colliers :</strong>
          <ul className="ml-4 list-disc">
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

      <div className="pt-2">
        <Link
          href={`/report?id=${observation.id}&returnTo=map`}
          className="inline-flex rounded-lg bg-black px-3 py-2 text-sm font-medium text-white"
        >
          Modifier la donnée
        </Link>
      </div>

      {typeof observation.gpsAccuracy === "number" && (
        <p>
          <strong>Précision GPS :</strong> {observation.gpsAccuracy} m
        </p>
      )}
    </div>
  );
}

export function MapView({
  userPosition = null,
  observations = [],
  onCenterChange,
  initialCenter,
  initialZoom = 13,
  editingObservationId,
}: {
  userPosition?: [number, number] | null;
  observations?: Observation[];
  onCenterChange?: (position: [number, number]) => void;
  initialCenter: [number, number];
  initialZoom?: number;
  editingObservationId?: string | null;
  fullScreen?: boolean;
}) {
  const [baseMap, setBaseMap] = useState<BaseMapKey>(() => {
    if (typeof window === "undefined") return "plan";

    const savedBaseMap = localStorage.getItem("chamois-base-map");

    if (
      savedBaseMap === "plan" ||
      savedBaseMap === "satellite" ||
      savedBaseMap === "relief"
    ) {
      return savedBaseMap;
    }

    return "plan";
  });

  useEffect(() => {
    localStorage.setItem("chamois-base-map", baseMap);
  }, [baseMap]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: "100vh", width: "100%" }}
      >
        <MapSizeFixer />
        <MapCenterTracker onCenterChange={onCenterChange} />

        {baseMap === "plan" && (
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        {baseMap === "satellite" && (
          <TileLayer
            attribution="Tiles &copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {baseMap === "relief" && (
          <TileLayer
            attribution="&copy; OpenTopoMap contributors"
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        )}

        {userPosition && (
          <Marker position={userPosition} icon={userIcon}>
            <Popup>Vous êtes ici.</Popup>
          </Marker>
        )}

        {observations.map((observation) => {
          const isEditing = editingObservationId === observation.id;

          return (
            <Marker
              key={observation.id}
              position={[observation.latitude, observation.longitude]}
              icon={isEditing ? editingObservationIcon : observationIcon}
            >
              <Popup closeButton={false} autoPan={true}>
                <ObservationPopupContent
                  observation={observation}
                  isEditing={isEditing}
                />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="absolute right-3 top-3 z-[1500] flex gap-2">
        <button
          type="button"
          onClick={() => setBaseMap("plan")}
          className={`rounded-md border px-3 py-1 text-sm font-medium shadow ${baseMap === "plan"
            ? "border-green-700 bg-green-700 text-white"
            : "border-gray-300 bg-white text-black"
            }`}
        >
          Plan
        </button>

        <button
          type="button"
          onClick={() => setBaseMap("satellite")}
          className={`rounded-md border px-3 py-1 text-sm font-medium shadow ${baseMap === "satellite"
            ? "border-green-700 bg-green-700 text-white"
            : "border-gray-300 bg-white text-black"
            }`}
        >
          Satellite
        </button>

        <button
          type="button"
          onClick={() => setBaseMap("relief")}
          className={`rounded-md border px-3 py-1 text-sm font-medium shadow ${baseMap === "relief"
            ? "border-green-700 bg-green-700 text-white"
            : "border-gray-300 bg-white text-black"
            }`}
        >
          Relief
        </button>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1000] -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-10 w-10">
          <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-black/90" />
          <div className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-black/90" />
          <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black bg-white" />
        </div>
      </div>
    </div>
  );
}