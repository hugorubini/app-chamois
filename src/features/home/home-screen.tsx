import Link from "next/link";

export function HomeScreen() {
  return (
    <main
      className="min-h-screen text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.25), rgba(255, 255, 255, 0.45)), url('/images/chamois-hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-8 pt-0">
        <header className="-mx-6">
          <div
            className="w-full px-6 pb-5 pt-8 text-center text-neutral-900 shadow-lg"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              borderBottomLeftRadius: "1rem",
              borderBottomRightRadius: "1rem",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-700">
              Réintroduction du chamois
            </p>

            <h1 className="mt-2 text-3xl font-bold leading-tight text-neutral-900">
              Application de suivi participatif
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-700">
              Signalez facilement une observation sur le terrain en plaçant
              directement un point sur la carte.
            </p>
          </div>
        </header>

        <div className="flex-1" />

        <section className="space-y-4 pb-4">
          <Link
            href="/map"
            className="block w-full rounded-2xl px-4 py-4 text-left text-neutral-900 shadow-lg"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.75)" }}
          >
            <span className="block text-lg font-semibold text-neutral-900">
              Carte / Enregistrer une donnée
            </span>
            <span className="mt-1 block text-sm text-neutral-700">
              Placez précisément un point puis complétez l’observation.
            </span>
          </Link>

          <Link
            href="/observations"
            className="block w-full rounded-2xl px-4 py-4 text-left text-neutral-900 shadow-lg"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.75)" }}
          >
            <span className="block text-lg font-semibold text-neutral-900">
              Mes observations
            </span>
            <span className="mt-1 block text-sm text-neutral-700">
              Retrouver les signalements enregistrés sur cet appareil.
            </span>
          </Link>

          <Link
            href="/info"
            className="block w-full rounded-2xl px-4 py-4 text-left text-neutral-900 shadow-lg"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.75)" }}
          >
            <span className="block text-lg font-semibold text-neutral-900">
              Infos / Aide
            </span>
            <span className="mt-1 block text-sm text-neutral-700">
              Comprendre le projet et consulter les consignes d’utilisation.
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}