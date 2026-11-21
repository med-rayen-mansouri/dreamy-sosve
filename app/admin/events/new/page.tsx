import { db } from "@/lib/db";
import { EventForm } from "@/components/event-form";
export default async function NewEvent({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const children = await db.child.findMany({
    select: { id: true, firstName: true, mother: { select: { name: true } } },
    orderBy: { firstName: "asc" },
  });
  return (
    <>
      <span className="eyebrow">Nouveau projet</span>
      <h1 className="page-title mb-7 mt-2">Créer un événement</h1>
      <EventForm
        options={children.map((child) => ({
          id: child.id,
          firstName: child.firstName,
          motherName: child.mother.name,
        }))}
        initial={{ type: type === "BIRTHDAY" ? "BIRTHDAY" : "SOS_EVENT" }}
      />
    </>
  );
}
