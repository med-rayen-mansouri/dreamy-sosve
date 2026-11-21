import { pageUser } from "@/lib/access";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { EventView } from "@/components/event-view";
export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await pageUser("MOTHER");
  const { id } = await params;
  const event = await db.event.findFirst({
    where: {
      id,
      status: { not: "DRAFT" },
      participants: { some: { motherId: user.id } },
    },
    include: {
      participants: {
        where: { motherId: user.id },
        include: { child: { select: { firstName: true } } },
      },
      tasks: { orderBy: { position: "asc" } },
      feedback: { where: { motherId: user.id } },
    },
  });
  if (!event) notFound();
  return <EventView event={event} role="mother" />;
}
