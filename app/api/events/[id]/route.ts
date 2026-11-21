import { db } from "@/lib/db";
import { apiUser, ApiError, fail } from "@/lib/access";
import { eventSchema } from "@/lib/validation";
type Context = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: Context) {
  try {
    const user = await apiUser();
    const { id } = await params;
    const event = await db.event.findUnique({
      where: { id },
      include: {
        participants: {
          include: { child: { select: { id: true, firstName: true } } },
        },
        tasks: { orderBy: { position: "asc" } },
        feedback: true,
      },
    });
    if (
      !event ||
      (user.role === "MOTHER" &&
        (event.status === "DRAFT" ||
          !event.participants.some((p) => p.motherId === user.id)))
    )
      throw new ApiError(404, "Événement introuvable.");
    if (user.role === "MOTHER")
      return Response.json({
        ...event,
        participants: event.participants.filter((p) => p.motherId === user.id),
        feedback: event.feedback.filter((f) => f.motherId === user.id),
      });
    return Response.json(event);
  } catch (e) {
    return fail(e);
  }
}
export async function PUT(request: Request, { params }: Context) {
  try {
    await apiUser("ADMIN");
    const { id } = await params;
    const existing = await db.event.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Événement introuvable.");
    if (["COMPLETED", "CANCELLED"].includes(existing.status))
      throw new ApiError(409, "Cet événement ne peut plus être modifié.");
    const input = eventSchema.parse(await request.json());
    if (
      input.type === "BIRTHDAY" &&
      (!input.birthdayChildId ||
        !input.childIds.includes(input.birthdayChildId))
    )
      throw new ApiError(
        400,
        "Sélectionnez l’enfant concerné par l’anniversaire.",
      );
    const children = await db.child.findMany({
      where: { id: { in: input.childIds } },
      select: { id: true, motherId: true },
    });
    if (children.length !== new Set(input.childIds).size)
      throw new ApiError(400, "Un enfant sélectionné est introuvable.");
    const { childIds, checklist, ...data } = input;
    const event = await db.$transaction(async (tx) => {
      const updated = await tx.event.update({
        where: { id },
        data: { ...data, eventDate: new Date(data.eventDate), status: "DRAFT" },
      });
      await tx.eventParticipant.deleteMany({
        where: { eventId: id, childId: { notIn: childIds } },
      });
      for (const child of children)
        await tx.eventParticipant.upsert({
          where: { eventId_childId: { eventId: id, childId: child.id } },
          create: { eventId: id, childId: child.id, motherId: child.motherId },
          update: {
            approvalStatus: "PENDING",
            motherComment: null,
            reviewedAt: null,
          },
        });
      await tx.eventTask.deleteMany({ where: { eventId: id } });
      await tx.eventTask.createMany({
        data: checklist.map((title, position) => ({
          eventId: id,
          title,
          position,
        })),
      });
      return updated;
    });
    return Response.json(event);
  } catch (e) {
    return fail(e);
  }
}
export async function DELETE(_: Request, { params }: Context) {
  try {
    await apiUser("ADMIN");
    const { id } = await params;
    const event = await db.event.findUnique({ where: { id } });
    if (!event) throw new ApiError(404, "Événement introuvable.");
    if (event.status !== "DRAFT")
      throw new ApiError(409, "Seul un brouillon peut être supprimé.");
    await db.event.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
