import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { EventView } from "@/components/event-view";
export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await db.event.findUnique({
    where: { id },
    include: {
      participants: { include: { child: { select: { firstName: true } } } },
      tasks: { orderBy: { position: "asc" } },
      feedback: true,
    },
  });
  if (!event) notFound();
  return <EventView event={event} role="admin" />;
}
