import { pageUser } from "@/lib/access";
import { db } from "@/lib/db";
import { dateFR, nextBirthday } from "@/components/shell";
import { EventList } from "@/components/event-list";
export default async function Birthdays() {
  const user = await pageUser("MOTHER");
  const [children, events] = await Promise.all([
    db.child.findMany({ where: { motherId: user.id } }),
    db.event.findMany({
      where: {
        type: "BIRTHDAY",
        status: { not: "DRAFT" },
        participants: { some: { motherId: user.id } },
      },
      include: {
        participants: { where: { motherId: user.id }, select: { id: true } },
      },
      orderBy: { eventDate: "asc" },
    }),
  ]);
  return (
    <>
      <span className="eyebrow">Moments spéciaux</span>
      <h1 className="page-title mt-2">Anniversaires</h1>
      <p className="muted mt-2">
        Les dates à venir et les projets à relire ensemble.
      </p>
      <div className="card mt-7">
        <h2 className="text-xl font-bold">Prochains anniversaires</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {children
            .sort(
              (a, b) =>
                nextBirthday(a.birthDate).getTime() -
                nextBirthday(b.birthDate).getTime(),
            )
            .map((child) => (
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
        role="mother"
        empty="Aucun projet d’anniversaire pour le moment."
      />
    </>
  );
}
