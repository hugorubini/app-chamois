"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getManyPhotos } from "../../lib/storage/photo-storage";
import { getArchivedObservations } from "../../lib/storage/archived-observations-storage";
import { getStoredObservations } from "../../lib/storage/observations-storage";
import type { Observation } from "../../types/observation";

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

export default function AllObservationsPage() {
    const [observations, setObservations] = useState<Observation[]>([]);

    useEffect(() => {
        const pendingObservations = getStoredObservations();
        const archivedObservations = getArchivedObservations();

        const merged = [...pendingObservations, ...archivedObservations].sort((a, b) => {
            const dateA = `${a.date}T${a.time}`;
            const dateB = `${b.date}T${b.time}`;
            return dateB.localeCompare(dateA);
        });

        setObservations(merged);
    }, []);

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
                            className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-neutral-700"
                        >
                            À envoyer
                        </Link>

                        <Link
                            href="/all-observations"
                            className="rounded-xl bg-black px-4 py-3 text-center text-sm font-semibold text-white"
                        >
                            <span className="text-white">Historique</span>
                        </Link>
                    </div>
                </div>

                <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                    Historique complet
                </p>
                <h1 className="mt-2 text-3xl font-bold">Toutes mes observations</h1>
                <p className="mt-4 text-base text-neutral-600">
                    Retrouvez ici les observations en attente et celles déjà envoyées.
                </p>

                <div className="mt-8 space-y-4">
                    {observations.length === 0 ? (
                        <div className="rounded-2xl border border-neutral-200 p-4 text-sm text-neutral-600">
                            Aucune observation enregistrée pour le moment.
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
                            </article>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}