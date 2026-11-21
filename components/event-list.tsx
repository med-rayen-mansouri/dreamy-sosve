import Link from "next/link";
import { dateFR, Empty, Pill } from "./shell";
type Item = {
  id: string;
  type: "BIRTHDAY" | "SOS_EVENT";
  title: string;
  eventDate: Date;
  location: string;
  status: string;
  participants: { id: string }[];
};
const status: Record<string, string> = {
  DRAFT: "Brouillon",
  AWAITING_APPROVAL: "Accord demandé",
  CHANGES_REQUESTED: "Modifications demandées",
  CONFIRMED: "Confirmé",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};
export function EventList({
  events,
  role,
  empty,
}: {
  events: Item[];
  role: "mother" | "admin";
  empty: string;
}) {
  return events.length ? (
    <div className="grid gap-4 md:grid-cols-2">
      {events.map((event) => (
        <Link
          key={event.id}
          href={`/${role}/events/${event.id}`}
          className="card hover:border-[#08A9E0]"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="eyebrow">
              {event.type === "BIRTHDAY" ? "Anniversaire" : "Événement SOS"}
            </span>
            <Pill coral={event.status === "CHANGES_REQUESTED"}>
              {status[event.status] || event.status}
            </Pill>
          </div>
          <h2 className="mt-3 text-xl font-bold">{event.title}</h2>
          <p className="muted mt-2 text-sm">
            {dateFR(event.eventDate)} · {event.location}
          </p>
          <p className="muted mt-1 text-sm">
            {event.participants.length} participant(s)
          </p>
          <span className="mt-4 inline-block text-sm font-bold text-[#1D3768]">
            Voir le projet →
          </span>
        </Link>
      ))}
    </div>
  ) : (
    <Empty
      text={empty}
      href={role === "admin" ? "/admin/events/new" : undefined}
      label={role === "admin" ? "Créer un événement" : undefined}
    />
  );
}
