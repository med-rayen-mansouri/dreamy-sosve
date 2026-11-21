import { db } from "@/lib/db";
import { apiUser, ApiError, fail } from "@/lib/access";
import { approvalSchema } from "@/lib/validation";
type Context = { params: Promise<{ id: string; participantId: string }> };
export async function PATCH(request: Request, { params }: Context) {
  try {
    const user = await apiUser("MOTHER");
    const { id, participantId } = await params;
    const participant = await db.eventParticipant.findFirst({
      where: { id: participantId, eventId: id, motherId: user.id },
      include: { event: true },
    });
    if (!participant) throw new ApiError(404, "Participation introuvable.");
    if (
      !["AWAITING_APPROVAL", "CHANGES_REQUESTED"].includes(
        participant.event.status,
      )
    )
      throw new ApiError(409, "L’avis n’est pas ouvert.");
    const input = approvalSchema.parse(await request.json());
    const result = await db.$transaction(async (tx) => {
      const updated = await tx.eventParticipant.update({
        where: { id: participantId },
        data: {
          approvalStatus: input.status,
          motherComment: input.comment,
          reviewedAt: new Date(),
        },
      });
      if (input.status === "CHANGES_REQUESTED")
        await tx.event.update({
          where: { id },
          data: { status: "CHANGES_REQUESTED" },
        });
      return updated;
    });
    return Response.json(result);
  } catch (e) {
    return fail(e);
  }
}
