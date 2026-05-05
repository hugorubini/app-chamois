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
        <p className="mt-4 text-base leading-7 text-neutral-600">
          Cette application permet de transmettre des observations de chamois
          dans le cadre du suivi participatif de la réintroduction du chamois en
          Ardèche.
        </p>

        <div className="mt-8 space-y-4">
          <section className="rounded-2xl border border-neutral-200 p-4">
            <h2 className="text-lg font-semibold">Le projet</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              Cette application a été créée pour compléter le suivi de la
              réintroduction du chamois en Ardèche. Elle permet à des
              particuliers de signaler simplement des observations de terrain
              géolocalisées, afin d’apporter des données utiles en complément du
              travail déjà réalisé par les techniciens.
            </p>
          </section>

          <section className="rounded-2xl border border-neutral-200 p-4">
            <h2 className="text-lg font-semibold">À quoi servent les données</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              Les observations transmises permettent d’améliorer la connaissance
              de la présence, des déplacements et de l’état des animaux
              réintroduits. Elles viennent compléter les suivis techniques de
              terrain et peuvent aider à mieux comprendre l’évolution de la
              réintroduction.
            </p>
          </section>

          <section className="rounded-2xl border border-neutral-200 p-4">
            <h2 className="text-lg font-semibold">Comment utiliser l’application</h2>
            <ol className="mt-3 ml-5 list-decimal space-y-2 text-sm leading-6 text-neutral-700">
              <li>Déplacez la carte sous la croix centrale.</li>
              <li>Placez le point à l’endroit de l’observation.</li>
              <li>Renseignez les informations principales utiles.</li>
              <li>Ajoutez si possible une photo ou des détails complémentaires.</li>
              <li>Enregistrez l’observation puis envoyez vos données.</li>
            </ol>
          </section>

          <section className="rounded-2xl border border-neutral-200 p-4">
            <h2 className="text-lg font-semibold">Ce qu’il faut transmettre</h2>
            <ul className="mt-3 ml-5 list-disc space-y-2 text-sm leading-6 text-neutral-700">
              <li>Le point d’observation le plus précis possible.</li>
              <li>Le nombre de chamois observés.</li>
              <li>La date et l’heure de l’observation.</li>
              <li>La présence éventuelle d’un collier.</li>
              <li>Une photo si elle est disponible.</li>
              <li>
                Des informations complémentaires seulement si elles peuvent être
                estimées avec un minimum de fiabilité.
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-neutral-200 p-4">
            <h2 className="text-lg font-semibold">Si vous avez un doute</h2>
            <ul className="mt-3 ml-5 list-disc space-y-2 text-sm leading-6 text-neutral-700">
              <li>Mieux vaut transmettre une donnée simple mais propre.</li>
              <li>Ne renseignez pas un numéro de collier si vous n’êtes pas sûr.</li>
              <li>
                Ne remplissez pas les détails optionnels si l’observation est
                trop brève ou trop lointaine.
              </li>
              <li>
                En cas d’incertitude, utilisez les choix “indéterminé” ou laissez
                les champs complémentaires vides.
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-neutral-200 p-4">
            <h2 className="text-lg font-semibold">À propos des colliers</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              Certains animaux peuvent être équipés d’un collier. Cette
              information est particulièrement utile pour le suivi. Toutefois,
              elle ne doit être renseignée que si l’observation permet une
              lecture suffisamment fiable.
            </p>
            <ul className="mt-3 ml-5 list-disc space-y-2 text-sm leading-6 text-neutral-700">
              <li>Indiquez la présence d’un collier seulement si vous l’avez bien vu.</li>
              <li>Ajoutez un numéro uniquement si sa lecture est fiable.</li>
              <li>
                En cas de doute, il vaut mieux ne pas renseigner de numéro plutôt
                que transmettre une information erronée.
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-neutral-200 p-4">
            <h2 className="text-lg font-semibold">Bonnes pratiques terrain</h2>
            <ul className="mt-3 ml-5 list-disc space-y-2 text-sm leading-6 text-neutral-700">
              <li>Ne vous approchez pas volontairement des animaux.</li>
              <li>Ne provoquez pas de dérangement pour mieux observer.</li>
              <li>Ne poursuivez pas les chamois pour obtenir plus d’informations.</li>
              <li>Restez prudent sur le terrain et ne vous mettez pas en danger.</li>
              <li>
                Cette application sert à transmettre des observations
                opportunistes, pas à rechercher activement les animaux.
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-neutral-200 p-4">
            <h2 className="text-lg font-semibold">Utilisation des données</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              Les données transmises servent au suivi du projet. Elles ont pour
              objectif d’améliorer la connaissance de la réintroduction et
              d’aider les gestionnaires à exploiter les observations recueillies
              sur le terrain.
            </p>
          </section>

          <section className="rounded-2xl border border-neutral-200 p-4">
            <h2 className="text-lg font-semibold">Qui gère ce projet ?</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              Cette application a été développée dans le cadre du suivi participatif de
              la réintroduction du chamois en Ardèche. Les données transmises ont
              vocation à compléter les suivis de terrain et à être exploitées par les
              gestionnaires du projet.
            </p>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              La structure porteuse du suivi est la Fédération Départementale des
              Chasseurs de l’Ardèche.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}