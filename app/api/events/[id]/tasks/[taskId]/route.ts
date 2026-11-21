import { db } from "@/lib/db";
import { apiUser, ApiError, fail } from "@/lib/access";
import { z } from "zod";
type Context = { params: Promise<{ id: string; taskId: string }> };
export async function PATCH(request: Request, { params }: Context) {
  try {
    await apiUser("ADMIN");
    const { id, taskId } = await params;
    const task = await db.eventTask.findFirst({
      where: { id: taskId, eventId: id },
      include: { event: true },
    });
    if (!task) throw new ApiError(404, "Tâche introuvable.");
    if (["COMPLETED", "CANCELLED"].includes(task.event.status))
      throw new ApiError(409, "Cet événement ne peut plus être modifié.");
    const input = z
      .object({
        completed: z.boolean().optional(),
        title: z.string().trim().min(1).max(180).optional(),
      })
      .parse(await request.json());
    return Response.json(
      await db.eventTask.update({ where: { id: taskId }, data: input }),
    );
  } catch (e) {
    return fail(e);
  }
}
export async function DELETE(_: Request, { params }: Context) {
  try {
    await apiUser("ADMIN");
    const { id, taskId } = await params;
    const task = await db.eventTask.findFirst({
      where: { id: taskId, eventId: id },
      include: { event: true },
    });
    if (!task) throw new ApiError(404, "Tâche introuvable.");
    if (["COMPLETED", "CANCELLED"].includes(task.event.status))
      throw new ApiError(409, "Cet événement ne peut plus être modifié.");
    await db.eventTask.delete({ where: { id: taskId } });
    return Response.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
