import Link from "next/link";
import { db } from "@/lib/db";
import { age, Empty, Pill } from "@/components/shell";
import { strings } from "@/lib/validation";
export default async function Children({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const children = await db.child.findMany({
    where: q ? { firstName: { contains: q } } : {},
    include: { mother: { select: { name: true } } },
    orderBy: { firstName: "asc" },
  });
  return (
    <>
      <span className="eyebrow">Planification</span>
      <h1 className="page-title mt-2">Enfants</h1>
      <p className="muted mt-2">
        Informations approuvées pour préparer les événements.
      </p>
      <form className="mt-6 flex max-w-md gap-2">
        <input
          aria-label="Rechercher un enfant"
          name="q"
          defaultValue={q}
          placeholder="Rechercher par prénom"
          className="field"
        />
        <button className="btn-primary">Chercher</button>
      </form>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {children.map((child) => (
          <Link
            href={`/admin/children/${child.id}`}
            key={child.id}
            className="card hover:border-[#08A9E0]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#CFEAF5] text-xl">
                {child.avatar || "🌟"}
              </div>
              <div>
                <h2 className="font-bold">
                  {child.firstName} · {age(child.birthDate)} ans
                </h2>
                <p className="muted text-sm">Maman : {child.mother.name}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {strings(child.interests)
                .slice(0, 3)
                .map((item) => (
                  <Pill key={item}>{item}</Pill>
                ))}
            </div>
            <span className="mt-4 inline-block text-sm font-bold text-[#1D3768]">
              Voir le profil →
            </span>
          </Link>
        ))}
      </div>
      {!children.length && (
        <div className="mt-8">
          <Empty text="Aucun enfant trouvé." />
        </div>
      )}
    </>
  );
}
