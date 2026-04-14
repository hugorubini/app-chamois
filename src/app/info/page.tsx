import Link from "next/link";

export default function InfoPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-8 text-neutral-900">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="mb-4 inline-flex w-fit rounded-xl border border-neutral-300 px-4 py-2 text-sm text-neutral-700"
        >
          ← Retour à l’accueil
        </Link>

        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Projet
        </p>
        <h1 className="mt-2 text-3xl font-bold">Infos / Aide</h1>
        <p className="mt-4 text-base text-neutral-600">
          Cette page présentera le projet, les consignes et l’aide à la saisie.
        </p>
      </div>
    </main>
  );
}