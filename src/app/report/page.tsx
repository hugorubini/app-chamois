export const dynamic = "force-dynamic";

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getManyPhotos, savePhoto } from "../../lib/storage/photo-storage";
import {
    getObservationById,
    saveObservation,
    updateObservation,
} from "../../lib/storage/observations-storage";
import type {
    Observation,
    ObservationBehavior,
    ObservationCertainty,
    ObservationType,
} from "../../types/observation";

type CollarPresence = "yes" | "no" | "unknown";

async function compressImage(file: File): Promise<string> {
    const imageUrl = URL.createObjectURL(file);

    try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () =>
                reject(new Error("Impossible de charger l’image."));
            image.src = imageUrl;
        });

        const maxWidth = 900;
        const maxHeight = 900;

        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("Impossible de créer le canvas.");
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.5;
        let compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

        const maxLength = 350000;

        while (compressedDataUrl.length > maxLength && quality > 0.2) {
            quality -= 0.1;
            compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        return compressedDataUrl;
    } finally {
        URL.revokeObjectURL(imageUrl);
    }
}

export default function ReportPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const observationId = searchParams.get("id");
    const latFromUrl = searchParams.get("lat") ?? "";
    const lngFromUrl = searchParams.get("lng") ?? "";
    const returnTo = searchParams.get("returnTo") ?? "";
    const isEditMode = Boolean(observationId);

    const now = useMemo(() => new Date(), []);
    const [date, setDate] = useState(now.toISOString().slice(0, 10));
    const [time, setTime] = useState(
        now.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        })
    );

    const [latitude, setLatitude] = useState(latFromUrl);
    const [longitude, setLongitude] = useState(lngFromUrl);
    const [numberOfAnimals, setNumberOfAnimals] = useState("");
    const [collarPresence, setCollarPresence] =
        useState<CollarPresence>("unknown");
    const [collarInput, setCollarInput] = useState("");
    const [collarNumbers, setCollarNumbers] = useState<string[]>([]);
    const [comment, setComment] = useState("");
    const [certainty, setCertainty] =
        useState<ObservationCertainty>("certain");
    const [observationType, setObservationType] =
        useState<ObservationType>("visual");
    const [behavior, setBehavior] =
        useState<ObservationBehavior>("movement");
    const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
    const [existingPhotoIds, setExistingPhotoIds] = useState<string[]>([]);
    const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
    const [statusMessage, setStatusMessage] = useState("");
    const [isLoaded, setIsLoaded] = useState(!isEditMode);

    function getReturnHref() {
        if (returnTo === "map") {
            return `/map?lat=${latitude}&lng=${longitude}`;
        }

        return "/observations";
    }

    useEffect(() => {
        if (!isEditMode || !observationId) {
            return;
        }

        const existingObservation = getObservationById(observationId);

        if (!existingObservation) {
            setStatusMessage("Observation introuvable.");
            setIsLoaded(true);
            return;
        }

        setDate(existingObservation.date);
        setTime(existingObservation.time);
        setLatitude(String(existingObservation.latitude));
        setLongitude(String(existingObservation.longitude));
        setNumberOfAnimals(String(existingObservation.numberOfAnimals));
        setCollarPresence(existingObservation.collarPresence);
        setCollarNumbers(existingObservation.collarNumbers ?? []);
        setComment(existingObservation.comment ?? "");
        setCertainty(existingObservation.certainty ?? "certain");
        setObservationType(existingObservation.observationType ?? "visual");
        setBehavior(existingObservation.behavior ?? "movement");
        setExistingPhotoIds(existingObservation.photoIds ?? []);
        setPhotoPreviewUrls([]);
        setIsLoaded(true);
    }, [isEditMode, observationId]);

    useEffect(() => {
        if (latFromUrl) {
            setLatitude(latFromUrl);
        }
        if (lngFromUrl) {
            setLongitude(lngFromUrl);
        }
    }, [latFromUrl, lngFromUrl]);

    useEffect(() => {
        let isMounted = true;

        async function loadExistingPhotos() {
            if (existingPhotoIds.length === 0) {
                setExistingPhotoUrls([]);
                return;
            }

            try {
                const urls = await getManyPhotos(existingPhotoIds);
                if (isMounted) {
                    setExistingPhotoUrls(urls);
                }
            } catch {
                if (isMounted) {
                    setExistingPhotoUrls([]);
                }
            }
        }

        loadExistingPhotos();

        return () => {
            isMounted = false;
        };
    }, [existingPhotoIds]);

    function handleAddCollarNumber() {
        const trimmedValue = collarInput.trim();

        if (!trimmedValue) {
            return;
        }

        const maxCollars = Number(numberOfAnimals);

        if (!maxCollars || maxCollars < 1) {
            setStatusMessage("Renseigne d’abord le nombre de chamois observés.");
            return;
        }

        if (collarNumbers.length >= maxCollars) {
            setStatusMessage(
                "Impossible d’ajouter plus de numéros de colliers que de chamois observés."
            );
            return;
        }

        if (collarNumbers.includes(trimmedValue)) {
            setStatusMessage("Ce numéro de collier a déjà été ajouté.");
            return;
        }

        setCollarNumbers((prev) => [...prev, trimmedValue]);
        setCollarInput("");
        setStatusMessage("");
    }

    function handleRemoveCollarNumber(numberToRemove: string) {
        setCollarNumbers((prev) =>
            prev.filter((number) => number !== numberToRemove)
        );
    }

    function handleRepositionOnMap() {
        const params = new URLSearchParams();

        if (observationId) params.set("id", observationId);
        if (date) params.set("date", date);
        if (time) params.set("time", time);
        if (latitude) params.set("lat", latitude);
        if (longitude) params.set("lng", longitude);
        if (numberOfAnimals) params.set("numberOfAnimals", numberOfAnimals);
        params.set("collarPresence", collarPresence);
        params.set("certainty", certainty);
        params.set("observationType", observationType);
        params.set("behavior", behavior);
        if (comment.trim()) params.set("comment", comment.trim());
        if (collarNumbers.length > 0) {
            params.set("collarNumbers", collarNumbers.join("|"));
        }

        if (returnTo) params.set("returnTo", returnTo);

        router.push(`/map?${params.toString()}`);
    }

    async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        if (files.length > 1) {
            setStatusMessage(
                "Pour le moment, teste avec une seule photo à la fois sur iPhone."
            );
        }

        try {
            const filesToProcess = Array.from(files).slice(0, 1);

            const results = await Promise.all(
                filesToProcess.map((file) => compressImage(file))
            );

            setPhotoPreviewUrls((prev) => [...prev, ...results]);
            setStatusMessage("Photos ajoutées avec compression.");
        } catch (error) {
            console.error("Erreur compression photo :", error);
            const message =
                error instanceof Error
                    ? error.message
                    : "Erreur inconnue pendant la compression.";
            setStatusMessage(
                `Impossible de lire ou compresser une photo : ${message}`
            );
        }

        event.target.value = "";
    }

    function handleRemovePhoto(indexToRemove: number) {
        setPhotoPreviewUrls((prev) =>
            prev.filter((_, index) => index !== indexToRemove)
        );
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!latitude || !longitude || !numberOfAnimals) {
            setStatusMessage("Le point ou le nombre de chamois est manquant.");
            return;
        }

        const maxCollars = Number(numberOfAnimals);
        const trimmedCollarInput = collarInput.trim();

        let finalCollarNumbers = collarNumbers;

        if (collarPresence === "yes" && trimmedCollarInput) {
            if (!collarNumbers.includes(trimmedCollarInput)) {
                if (collarNumbers.length >= maxCollars) {
                    setStatusMessage(
                        "Impossible d’ajouter plus de numéros de colliers que de chamois observés."
                    );
                    return;
                }

                finalCollarNumbers = [...collarNumbers, trimmedCollarInput];
            }
        }

        if (collarPresence === "yes" && finalCollarNumbers.length > maxCollars) {
            setStatusMessage(
                "Le nombre de colliers ne peut pas dépasser le nombre de chamois observés."
            );
            return;
        }

        let newPhotoIds: string[] = [];

        try {
            newPhotoIds = await Promise.all(
                photoPreviewUrls.map((photoDataUrl) => savePhoto(photoDataUrl))
            );
        } catch (error) {
            console.error("Erreur enregistrement photo :", error);
            const message =
                error instanceof Error
                    ? error.message
                    : "Erreur inconnue pendant l’enregistrement.";
            setStatusMessage(`Impossible d’enregistrer les photos : ${message}`);
            return;
        }

        const observation: Observation = {
            id:
                observationId ??
                (Date.now().toString(36) +
                    "-" +
                    Math.random().toString(36).slice(2, 10)),
            date,
            time,
            latitude: Number(latitude),
            longitude: Number(longitude),
            numberOfAnimals: Number(numberOfAnimals),
            collarPresence,
            collarNumbers: collarPresence === "yes" ? finalCollarNumbers : [],
            comment: comment.trim(),
            certainty,
            observationType,
            behavior,
            photoIds: [...existingPhotoIds, ...newPhotoIds],
            syncStatus: "pending",
        };

        try {
            if (isEditMode) {
                updateObservation(observation);
                router.push(getReturnHref());
                return;
            }

            saveObservation(observation);
            router.push(`/map?lat=${latitude}&lng=${longitude}`);
        } catch {
            setStatusMessage(
                "Impossible d’enregistrer l’observation dans le stockage local."
            );
        }
    }

    if (!isLoaded) {
        return (
            <main className="min-h-screen bg-white px-6 py-8 text-neutral-900">
                <div className="mx-auto max-w-md">
                    <p className="text-sm text-neutral-600">
                        Chargement de l’observation...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white px-6 py-8 text-neutral-900">
            <div className="mx-auto max-w-md">
                <Link
                    href={
                        isEditMode
                            ? getReturnHref()
                            : `/map?lat=${latitude}&lng=${longitude}`
                    }
                    className="mb-4 inline-flex w-fit rounded-xl border border-neutral-300 px-4 py-2 text-sm text-neutral-700"
                >
                    ← Retour
                </Link>

                <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                    {isEditMode ? "Modification" : "Nouvelle donnée"}
                </p>
                <h1 className="mt-2 text-3xl font-bold">
                    {isEditMode
                        ? "Modifier une observation"
                        : "Enregistrer une observation"}
                </h1>
                <p className="mt-4 text-base text-neutral-600">
                    {isEditMode
                        ? "Modifiez les informations de cette observation."
                        : "Complétez les informations pour le point placé sur la carte."}
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <section className="space-y-4 overflow-hidden rounded-2xl border border-neutral-200 p-4">
                        <h2 className="text-lg font-semibold">Point sélectionné</h2>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="block h-[56px] w-full min-w-0 max-w-full appearance-none rounded-xl border border-neutral-300 px-3 py-3 text-base box-border"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Heure</label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="block h-[56px] w-full min-w-0 max-w-full appearance-none rounded-xl border border-neutral-300 px-3 py-3 text-base box-border"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Latitude</label>
                            <input
                                value={latitude}
                                readOnly
                                className="block w-full min-w-0 max-w-full rounded-xl border border-neutral-300 px-3 py-3 text-base box-border"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Longitude</label>
                            <input
                                value={longitude}
                                readOnly
                                className="block w-full min-w-0 max-w-full rounded-xl border border-neutral-300 px-3 py-3 text-base box-border"
                            />
                        </div>

                        {isEditMode && (
                            <button
                                type="button"
                                onClick={handleRepositionOnMap}
                                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-900"
                            >
                                Replacer le point sur la carte
                            </button>
                        )}
                    </section>

                    <section className="space-y-4 rounded-2xl border border-neutral-200 p-4">
                        <h2 className="text-lg font-semibold">Observation</h2>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Nombre de chamois observés
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={numberOfAnimals}
                                onChange={(e) => setNumberOfAnimals(e.target.value)}
                                placeholder="Ex. 3"
                                className="block w-full min-w-0 max-w-full rounded-xl border border-neutral-300 px-3 py-3 text-base box-border"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Certitude</label>
                            <select
                                value={certainty}
                                onChange={(e) =>
                                    setCertainty(e.target.value as ObservationCertainty)
                                }
                                className="block w-full min-w-0 max-w-full rounded-xl border border-neutral-300 px-3 py-3 text-base box-border"
                            >
                                <option value="certain">Certain</option>
                                <option value="probable">Probable</option>
                                <option value="doubtful">Douteux</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Type d’observation
                            </label>
                            <select
                                value={observationType}
                                onChange={(e) =>
                                    setObservationType(e.target.value as ObservationType)
                                }
                                className="block w-full min-w-0 max-w-full rounded-xl border border-neutral-300 px-3 py-3 text-base box-border"
                            >
                                <option value="visual">Visuel</option>
                                <option value="auditory">Contact auditif</option>
                                <option value="olfactory">Contact olfactif</option>
                                <option value="droppings">Crotte</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Comportement
                            </label>
                            <select
                                value={behavior}
                                onChange={(e) =>
                                    setBehavior(e.target.value as ObservationBehavior)
                                }
                                className="block w-full min-w-0 max-w-full rounded-xl border border-neutral-300 px-3 py-3 text-base box-border"
                            >
                                <option value="movement">Déplacement</option>
                                <option value="feeding">Alimentation</option>
                                <option value="rest">Repos</option>
                                <option value="flight">Fuite</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium">
                                Animal équipé d’un collier ?
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCollarPresence("yes")}
                                    className={`rounded-xl border px-3 py-3 text-sm ${collarPresence === "yes"
                                        ? "border-black bg-black text-white"
                                        : "border-neutral-300 bg-white text-neutral-900"
                                        }`}
                                >
                                    Oui
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setCollarPresence("no")}
                                    className={`rounded-xl border px-3 py-3 text-sm ${collarPresence === "no"
                                        ? "border-black bg-black text-white"
                                        : "border-neutral-300 bg-white text-neutral-900"
                                        }`}
                                >
                                    Non
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setCollarPresence("unknown")}
                                    className={`rounded-xl border px-3 py-3 text-sm ${collarPresence === "unknown"
                                        ? "border-black bg-black text-white"
                                        : "border-neutral-300 bg-white text-neutral-900"
                                        }`}
                                >
                                    Inconnu
                                </button>
                            </div>
                        </div>

                        {collarPresence === "yes" && (
                            <div className="space-y-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Ajouter un numéro de collier
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            value={collarInput}
                                            onChange={(e) => setCollarInput(e.target.value)}
                                            placeholder="Ex. C418"
                                            className="block w-full min-w-0 max-w-full rounded-xl border border-neutral-300 px-3 py-3 text-base box-border"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCollarNumber}
                                            className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white"
                                        >
                                            Ajouter
                                        </button>
                                    </div>
                                </div>

                                {collarNumbers.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Numéros ajoutés</p>

                                        {collarNumbers.map((number) => (
                                            <div
                                                key={number}
                                                className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2"
                                            >
                                                <span className="text-sm">{number}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCollarNumber(number)}
                                                    className="text-sm text-red-600"
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    <section className="space-y-4 rounded-2xl border border-neutral-200 p-4">
                        <h2 className="text-lg font-semibold">Photos</h2>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Ajouter une ou plusieurs photos
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handlePhotoChange}
                                className="block w-full min-w-0 max-w-full rounded-xl border border-neutral-300 px-3 py-3 text-base box-border"
                            />
                        </div>

                        {(existingPhotoUrls.length > 0 || photoPreviewUrls.length > 0) && (
                            <div className="grid grid-cols-2 gap-3">
                                {existingPhotoUrls.map((photoUrl, index) => (
                                    <div
                                        key={`existing-${photoUrl}-${index}`}
                                        className="rounded-xl border border-neutral-200 p-2"
                                    >
                                        <img
                                            src={photoUrl}
                                            alt={`Photo existante ${index + 1}`}
                                            className="h-32 w-full rounded-lg object-cover"
                                        />
                                    </div>
                                ))}

                                {photoPreviewUrls.map((photoUrl, index) => (
                                    <div
                                        key={`new-${photoUrl}-${index}`}
                                        className="rounded-xl border border-neutral-200 p-2"
                                    >
                                        <img
                                            src={photoUrl}
                                            alt={`Nouvelle photo ${index + 1}`}
                                            className="h-32 w-full rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePhoto(index)}
                                            className="mt-2 w-full rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700"
                                        >
                                            Supprimer la photo
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="space-y-4 rounded-2xl border border-neutral-200 p-4">
                        <h2 className="text-lg font-semibold">Commentaire</h2>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Remarque facultative
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Ex. Groupe en déplacement vers la crête"
                                rows={4}
                                className="block w-full min-w-0 max-w-full rounded-xl border border-neutral-300 px-3 py-3 text-base box-border"
                            />
                        </div>
                    </section>

                    <button
                        type="submit"
                        className="w-full rounded-2xl bg-black px-4 py-4 text-sm font-semibold text-white"
                    >
                        {isEditMode
                            ? "Enregistrer les modifications"
                            : "Enregistrer la donnée"}
                    </button>

                    {statusMessage && (
                        <p className="rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
                            {statusMessage}
                        </p>
                    )}
                </form>
            </div>
        </main>
    );
}