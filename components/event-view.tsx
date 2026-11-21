import Link from "next/link";
import { dateFR, Pill } from "./shell";
import { strings } from "@/lib/validation";
import { EventActions } from "./event-actions";
type Participant = {
  id: string;
  childId: string;
  approvalStatus: string;
  motherComment: string | null;
  child: { firstName: string };
};
type Task = { id: string; title: string; completed: boolean };
type Feedback = {
  id: string;
  childId: string;
  enjoyed: boolean;
  comfortable: boolean;
  favoriteActivity: string | null;
  comment: string | null;
};
type EventData = {
  id: string;
  type: "BIRTHDAY" | "SOS_EVENT";
  title: string;
  description: string | null;
  category: string | null;
  eventDate: Date;
  location: string;
  theme: string | null;
  plannedActivities: unknown;
  suggestedGiftIdeas: unknown;
  preparationNotes: string | null;
  status: string;
  participants: Participant[];
  tasks: Task[];
  feedback: Feedback[];
};
const statuses: Record<string, string> = {
  DRAFT: "Brouillon",
  AWAITING_APPROVAL: "Accord demandé",
  CHANGES_REQUESTED: "Modifications demandées",
  CONFIRMED: "Confirmé",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};
export function EventView({
  event,
  role,
}: {
  event: EventData;
  role: "mother" | "admin";
}) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="eyebrow">
            {event.type === "BIRTHDAY" ? "Anniversaire" : "Événement SOS"}
          </span>
          <h1 className="page-title mt-2">{event.title}</h1>
          <p className="muted mt-2">
            {dateFR(event.eventDate)} · {event.location}
          </p>
        </div>
        <Pill coral={event.status === "CHANGES_REQUESTED"}>
          {statuses[event.status] || event.status}
        </Pill>
      </div>
      <div className="mt-7 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <div className="card">
            <h2 className="text-xl font-bold">Le projet</h2>
            {event.category && (
              <p className="muted mt-2 text-sm">{event.category}</p>
            )}
            {event.description && (
              <p className="mt-4 whitespace-pre-wrap">{event.description}</p>
            )}
            {event.theme && (
              <p className="mt-4">
                <strong>Thème :</strong> {event.theme}
              </p>
            )}
            <Section
              title="Activités"
              items={strings(event.plannedActivities)}
            />
            {event.type === "BIRTHDAY" && (
              <Section
                title="Idées de cadeaux"
                items={strings(event.suggestedGiftIdeas)}
              />
            )}
            {event.preparationNotes && (
              <div className="mt-5">
                <h3 className="font-bold">Notes de préparation</h3>
                <p className="muted mt-2 whitespace-pre-wrap">
                  {event.preparationNotes}
                </p>
              </div>
            )}
          </div>
          <div className="card">
            <h2 className="text-xl font-bold">Enfants concernés</h2>
            <div className="mt-4 space-y-3">
              {event.participants.map((p) => (
                <div key={p.id} className="rounded-xl bg-[#EFFAFF] p-3">
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold">{p.child.firstName}</span>
                    <Pill>
                      {p.approvalStatus === "APPROVED"
                        ? "Approuvé"
                        : p.approvalStatus === "DECLINED"
                          ? "Refusé"
                          : p.approvalStatus === "CHANGES_REQUESTED"
                            ? "Modification demandée"
                            : "En attente"}
                    </Pill>
                  </div>
                  {p.motherComment && (
                    <p className="muted mt-2 text-sm">{p.motherComment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          {event.feedback.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold">Retours après l’événement</h2>
              <div className="mt-3 space-y-3">
                {event.feedback.map((item) => (
                  <div key={item.id} className="rounded-xl bg-[#EFFAFF] p-3">
                    <p className="font-semibold">
                      {
                        event.participants.find(
                          (p) => p.childId === item.childId,
                        )?.child.firstName
                      }
                    </p>
                    <p className="muted text-sm">
                      Apprécié : {item.enjoyed ? "Oui" : "Non"} · À l’aise :{" "}
                      {item.comfortable ? "Oui" : "Non"}
                    </p>
                    {item.favoriteActivity && (
                      <p className="text-sm">
                        Activité préférée : {item.favoriteActivity}
                      </p>
                    )}
                    {item.comment && (
                      <p className="mt-2 whitespace-pre-wrap text-sm">
                        {item.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <aside className="space-y-5">
          <div className="card">
            <h2 className="text-xl font-bold">Préparation</h2>
            {event.tasks.length ? (
              <ul className="mt-4 space-y-3">
                {event.tasks.map((task) => (
                  <li key={task.id} className="flex gap-2 text-sm">
                    <span
                      className={
                        task.completed ? "text-[#08A9E0]" : "text-[#1D3768]"
                      }
                    >
                      {task.completed ? "✓" : "○"}
                    </span>
                    <span className={task.completed ? "line-through" : ""}>
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted mt-3 text-sm">Aucune tâche ajoutée.</p>
            )}
          </div>
          {role === "admin" &&
            !["COMPLETED", "CANCELLED"].includes(event.status) && (
              <Link
                href={`/admin/events/${event.id}/edit`}
                className="btn-secondary w-full"
              >
                Modifier le projet
              </Link>
            )}
        </aside>
      </div>
      <EventActions
        eventId={event.id}
        role={role}
        status={event.status}
        participants={event.participants}
        tasks={event.tasks}
        feedback={event.feedback}
      />
    </>
  );
}
function Section({ title, items }: { title: string; items: string[] }) {
  return items.length ? (
    <div className="mt-5">
      <h3 className="font-bold">{title}</h3>
      <ul className="mt-2 list-inside list-disc space-y-1 text-[#1D3768]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  ) : null;
}
