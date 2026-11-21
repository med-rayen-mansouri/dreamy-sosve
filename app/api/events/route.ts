import { db } from "@/lib/db";
import { apiUser, ApiError, fail } from "@/lib/access";
import { eventSchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await apiUser();
    const events = await db.event.findMany({
      where:
        user.role === "MOTHER"
          ? {
              status: { not: "DRAFT" },
              participants: { some: { motherId: user.id } },
            }
          : {},
      include: {
        participants: {
          where: user.role === "MOTHER" ? { motherId: user.id } : {},
          include: { child: { select: { firstName: true } } },
        },
        tasks: true,
      },
      orderBy: { eventDate: "asc" },
    });
    return Response.json(events);
  } catch (e) {
    return fail(e);
  }
}
export async function POST(request: Request) {
  try {
    const user = await apiUser("ADMIN");
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
    if (!childIds.length)
      throw new ApiError(400, "Ajoutez un enfant participant.");
    const event = await db.event.create({
      data: {
        ...data,
        eventDate: new Date(data.eventDate),
        organizerId: user.id,
        participants: {
          create: children.map((child) => ({
            childId: child.id,
            motherId: child.motherId,
          })),
        },
        tasks: {
          create: checklist.map((title, position) => ({ title, position })),
        },
      },
    });
    return Response.json(event, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
