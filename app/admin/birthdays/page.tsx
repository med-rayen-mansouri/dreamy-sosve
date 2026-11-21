import Link from "next/link";
import { db } from "@/lib/db";
import { dateFR, nextBirthday } from "@/components/shell";
import { EventList } from "@/components/event-list";
export default async function Birthdays() {
  const [children, events] = await Promise.all([
    db.child.findMany({ orderBy: { firstName: "asc" } }),
    db.event.findMany({
      where: { type: "BIRTHDAY" },
      include: { participants: { select: { id: true } } },
      orderBy: { eventDate: "asc" },
    }),
  ]);
  const upcoming = [...children]
    .sort(
      (a, b) =>
        nextBirthday(a.birthDate).getTime() -
        nextBirthday(b.birthDate).getTime(),
    )
    .slice(0, 8);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Moments spéciaux</span>
          <h1 className="page-title mt-2">Anniversaires</h1>
        </div>
        <Link href="/admin/events/new?type=BIRTHDAY" className="btn-primary">
          Préparer un anniversaire
        </Link>
      </div>
      <div className="card mt-7">
        <h2 className="text-xl font-bold">Prochains anniversaires</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {upcoming.map((child) => (
            <div
              key={child.id}
              className="flex justify-between gap-3 rounded-xl bg-[#EFFAFF] p-3"
            >
              <span className="font-semibold">{child.firstName}</span>
              <span className="muted text-sm">
                {dateFR(nextBirthday(child.birthDate))}
              </span>
            </div>
          ))}
        </div>
      </div>
      <h2 className="mb-4 mt-9 text-xl font-bold">Projets d’anniversaire</h2>
      <EventList
        events={events}
        role="admin"
        empty="Aucun anniversaire planifié."
      />
    </>
  );
}
