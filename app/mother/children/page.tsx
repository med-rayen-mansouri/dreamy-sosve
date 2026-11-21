import Link from "next/link";
import { pageUser } from "@/lib/access";
import { db } from "@/lib/db";
import { age, Empty, Pill, strings } from "@/components/child-display";
export default async function Children() {
  const user = await pageUser("MOTHER");
  const children = await db.child.findMany({
    where: { motherId: user.id },
    orderBy: { firstName: "asc" },
  });
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Profils</span>
          <h1 className="page-title mt-2">Mes enfants</h1>
          <p className="muted mt-2">
            Leurs envies, leurs idées et ce qui les met à l’aise.
          </p>
        </div>
        <Link href="/mother/children/new" className="btn-primary">
          Ajouter un enfant
        </Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {children.map((child) => (
          <Link
            href={`/mother/children/${child.id}`}
            key={child.id}
            className="card hover:border-[#08A9E0]"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#CFEAF5] text-2xl">
                {child.avatar || "🌟"}
              </div>
              <div>
                <h2 className="text-lg font-bold">{child.firstName}</h2>
                <p className="muted text-sm">{age(child.birthDate)} ans</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {strings(child.interests)
                .slice(0, 3)
                .map((item) => (
                  <Pill key={item}>{item}</Pill>
                ))}
            </div>
            <span className="mt-5 inline-block text-sm font-bold text-[#1D3768]">
              Voir le profil →
            </span>
          </Link>
        ))}
      </div>
      {!children.length && (
        <div className="mt-8">
          <Empty
            text="Aucun profil créé."
            href="/mother/children/new"
            label="Ajouter un enfant"
          />
        </div>
      )}
    </>
  );
}
