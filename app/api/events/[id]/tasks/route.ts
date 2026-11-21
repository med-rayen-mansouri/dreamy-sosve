import { db } from "@/lib/db";
import { apiUser, ApiError, fail } from "@/lib/access";
import { taskSchema } from "@/lib/validation";
type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, { params }: Context) {
  try {
    await apiUser("ADMIN");
    const { id } = await params;
    const event = await db.event.findUnique({ where: { id } });
    if (!event) throw new ApiError(404, "Événement introuvable.");
    if (["COMPLETED", "CANCELLED"].includes(event.status))
      throw new ApiError(409, "Cet événement ne peut plus être modifié.");
    const { title } = taskSchema.parse(await request.json());
    const count = await db.eventTask.count({ where: { eventId: id } });
    return Response.json(
      await db.eventTask.create({
        data: { eventId: id, title, position: count },
      }),
      { status: 201 },
    );
  } catch (e) {
    return fail(e);
  }
}
