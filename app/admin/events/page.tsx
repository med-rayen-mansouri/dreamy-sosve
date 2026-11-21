import Link from "next/link";
import { db } from "@/lib/db";
import { EventList } from "@/components/event-list";
export default async function Events() {
  const events = await db.event.findMany({
    include: { participants: { select: { id: true } } },
    orderBy: { eventDate: "asc" },
  });
  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Organisation</span>
          <h1 className="page-title mt-2">Événements SOS</h1>
          <p className="muted mt-2">
            Préparer, demander les accords et suivre chaque projet.
          </p>
        </div>
        <Link href="/admin/events/new" className="btn-primary">
          Créer un événement
        </Link>
      </div>
      <EventList events={events} role="admin" empty="Aucun événement créé." />
    </>
  );
}
