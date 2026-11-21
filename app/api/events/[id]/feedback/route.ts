import { db } from "@/lib/db";
import { apiUser, ApiError, fail } from "@/lib/access";
import { feedbackSchema } from "@/lib/validation";
import { z } from "zod";
type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, { params }: Context) {
  try {
    const user = await apiUser("MOTHER");
    const { id } = await params;
    const input = z
      .object({ childId: z.string(), ...feedbackSchema.shape })
      .parse(await request.json());
    const participant = await db.eventParticipant.findFirst({
      where: { eventId: id, childId: input.childId, motherId: user.id },
      include: { event: true },
    });
    if (!participant) throw new ApiError(404, "Participation introuvable.");
    if (participant.event.status !== "COMPLETED")
      throw new ApiError(409, "Le retour est disponible après l’événement.");
    return Response.json(
      await db.eventFeedback.upsert({
        where: { eventId_childId: { eventId: id, childId: input.childId } },
        create: { ...input, eventId: id, motherId: user.id },
        update: {
          enjoyed: input.enjoyed,
          comfortable: input.comfortable,
          favoriteActivity: input.favoriteActivity,
          comment: input.comment,
        },
      }),
    );
  } catch (e) {
    return fail(e);
  }
}
