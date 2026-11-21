import Link from "next/link";
import { db } from "@/lib/db";
import { dateFR, Empty } from "@/components/shell";
import { CalendarDays, ClipboardCheck, Users } from "lucide-react";
export default async function Dashboard() {
  const [children, events, pending] = await Promise.all([
    db.child.count(),
    db.event.findMany({
      where: { eventDate: { gte: new Date() } },
      orderBy: { eventDate: "asc" },
      take: 6,
      include: { participants: true },
    }),
    db.eventParticipant.count({
      where: {
        approvalStatus: "PENDING",
        event: { status: "AWAITING_APPROVAL" },
      },
    }),
  ]);
  return (
    <>
      <span className="eyebrow">Organisation SOS</span>
      <h1 className="page-title mt-2">Tableau de bord</h1>
      <p className="muted mt-2">
        Un aperçu clair des prochains moments à préparer.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat icon={<Users />} value={children} label="Profils d’enfants" />
        <Stat
          icon={<CalendarDays />}
          value={events.length}
          label="Événements à venir"
        />
        <Stat
          icon={<ClipboardCheck />}
          value={pending}
          label="Accords en attente"
        />
      </div>
      <section className="mt-9">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Prochains événements</h2>
          <Link href="/admin/events/new" className="btn-primary">
            Créer un événement
          </Link>
        </div>
        {events.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <Link
                href={`/admin/events/${event.id}`}
                key={event.id}
                className="card hover:border-[#08A9E0]"
              >
                <p className="eyebrow">
                  {event.type === "BIRTHDAY" ? "Anniversaire" : "Événement SOS"}
                </p>
                <h3 className="mt-2 text-lg font-bold">{event.title}</h3>
                <p className="muted mt-2 text-sm">
                  {dateFR(event.eventDate)} · {event.participants.length}{" "}
                  enfant(s)
                </p>
                <p className="mt-3 text-sm font-semibold text-[#1D3768]">
                  Voir les détails →
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <Empty
            text="Aucun événement à venir."
            href="/admin/events/new"
            label="Créer un événement"
          />
        )}
      </section>
    </>
  );
}
function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="card">
      <div className="text-[#08A9E0]">{icon}</div>
      <p className="mt-4 text-3xl font-bold text-[#E2556A]">{value}</p>
      <p className="muted text-sm">{label}</p>
    </div>
  );
}
