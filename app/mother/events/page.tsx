import { pageUser } from "@/lib/access";
import { db } from "@/lib/db";
import { EventList } from "@/components/event-list";
export default async function Events() {
  const user = await pageUser("MOTHER");
  const events = await db.event.findMany({
    where: {
      participants: { some: { motherId: user.id } },
      status: { not: "DRAFT" },
    },
    include: {
      participants: { where: { motherId: user.id }, select: { id: true } },
    },
    orderBy: { eventDate: "asc" },
  });
  return (
    <>
      <span className="eyebrow">À partager</span>
      <h1 className="page-title mt-2">Événements</h1>
      <p className="muted mb-7 mt-2">
        Consultez les projets qui concernent vos enfants et donnez votre avis.
      </p>
      <EventList
        events={events}
        role="mother"
        empty="Aucun événement à consulter pour le moment."
      />
    </>
  );
}
