import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/event-form";
import { strings } from "@/lib/validation";
export default async function EditEvent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event, children] = await Promise.all([
    db.event.findUnique({
      where: { id },
      include: { participants: true, tasks: { orderBy: { position: "asc" } } },
    }),
    db.child.findMany({
      select: { id: true, firstName: true, mother: { select: { name: true } } },
      orderBy: { firstName: "asc" },
    }),
  ]);
  if (!event || ["COMPLETED", "CANCELLED"].includes(event.status)) notFound();
  const initial = {
    type: event.type,
    title: event.title,
    description: event.description || "",
    category: event.category || "",
    eventDate: new Date(
      event.eventDate.getTime() - event.eventDate.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16),
    location: event.location,
    birthdayChildId: event.birthdayChildId || "",
    theme: event.theme || "",
    plannedActivities: strings(event.plannedActivities).join("\n"),
    suggestedGiftIdeas: strings(event.suggestedGiftIdeas).join("\n"),
    preparationNotes: event.preparationNotes || "",
    checklist: event.tasks.map((task) => task.title).join("\n"),
  };
  return (
    <>
      <span className="eyebrow">Projet d’événement</span>
      <h1 className="page-title mb-7 mt-2">Modifier {event.title}</h1>
      <EventForm
        id={id}
        initial={initial}
        selected={event.participants.map((p) => p.childId)}
        options={children.map((child) => ({
          id: child.id,
          firstName: child.firstName,
          motherName: child.mother.name,
        }))}
      />
    </>
  );
}
