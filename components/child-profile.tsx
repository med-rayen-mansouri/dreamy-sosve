import { age, Pill } from "./shell";
import { strings } from "@/lib/validation";
import type { Child } from "@prisma/client";
export function ChildProfile({ child }: { child: Child }) {
  const sections: [string, unknown][] = [
    ["Personnalité", child.personalityTags],
    ["Centres d’intérêt", child.interests],
    ["Activités préférées", child.favoriteActivities],
    ["Couleurs préférées", child.favoriteColors],
    ["Thèmes d’anniversaire", child.birthdayThemes],
    ["Souhaits de cadeaux", child.giftWishes],
    ["Confort", child.comfortPreferences],
  ];
  return (
    <>
      <div className="card flex items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#CFEAF5] text-4xl">
          {child.avatar || "🌟"}
        </div>
        <div>
          <h1 className="page-title">{child.firstName}</h1>
          <p className="muted">{age(child.birthDate)} ans</p>
        </div>
      </div>
      {child.description && (
        <div className="card mt-5">
          <h2 className="font-bold">Présentation</h2>
          <p className="muted mt-2 whitespace-pre-wrap">{child.description}</p>
        </div>
      )}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {sections.map(([title, value]) => (
          <div key={title} className="card">
            <h2 className="font-bold">{title}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {strings(value).length ? (
                strings(value).map((item) => <Pill key={item}>{item}</Pill>)
              ) : (
                <p className="muted text-sm">À compléter</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {child.approvedPlanningSummary && (
        <div className="card mt-5">
          <h2 className="font-bold">Résumé approuvé pour la planification</h2>
          <p className="muted mt-2 whitespace-pre-wrap">
            {child.approvedPlanningSummary}
          </p>
        </div>
      )}
    </>
  );
}
