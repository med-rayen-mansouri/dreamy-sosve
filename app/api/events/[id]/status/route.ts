import { db } from "@/lib/db";
import { apiUser, ApiError, fail } from "@/lib/access";
import { z } from "zod";
type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, { params }: Context) {
  try {
    await apiUser("ADMIN");
    const { id } = await params;
    const { status } = z
      .object({
        status: z.enum([
          "AWAITING_APPROVAL",
          "CONFIRMED",
          "COMPLETED",
          "CANCELLED",
        ]),
      })
      .parse(await request.json());
    const event = await db.event.findUnique({
      where: { id },
      include: { participants: true },
    });
    if (!event) throw new ApiError(404, "Événement introuvable.");
    const allowed: Record<string, string[]> = {
      DRAFT: ["AWAITING_APPROVAL", "CANCELLED"],
      AWAITING_APPROVAL: ["CONFIRMED", "CANCELLED"],
      CHANGES_REQUESTED: ["AWAITING_APPROVAL", "CANCELLED"],
      CONFIRMED: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    };
    if (!allowed[event.status].includes(status))
      throw new ApiError(409, "Transition indisponible.");
    if (status === "AWAITING_APPROVAL" && !event.participants.length)
      throw new ApiError(
        409,
        "Ajoutez des participants avant de demander leur accord.",
      );
    if (
      status === "CONFIRMED" &&
      event.participants.some((p) => p.approvalStatus !== "APPROVED")
    )
      throw new ApiError(
        409,
        "Tous les accords sont requis avant confirmation.",
      );
    if (status === "COMPLETED" && event.eventDate > new Date())
      throw new ApiError(
        409,
        "L’événement ne peut être terminé avant sa date.",
      );
    return Response.json(
      await db.event.update({ where: { id }, data: { status } }),
    );
  } catch (e) {
    return fail(e);
  }
}
