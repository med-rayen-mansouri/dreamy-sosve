import { db } from "@/lib/db";
import { apiUser, ApiError, fail } from "@/lib/access";
import { noteSchema } from "@/lib/validation";
type Context = { params: Promise<{ id: string; noteId: string }> };
export async function PUT(request: Request, { params }: Context) {
  try {
    const user = await apiUser("MOTHER");
    const { id, noteId } = await params;
    const note = await db.childNote.findFirst({
      where: { id: noteId, childId: id, motherId: user.id },
    });
    if (!note) throw new ApiError(404, "Note introuvable.");
    const input = noteSchema.parse(await request.json());
    return Response.json(
      await db.childNote.update({ where: { id: noteId }, data: input }),
    );
  } catch (e) {
    return fail(e);
  }
}
export async function DELETE(_: Request, { params }: Context) {
  try {
    const user = await apiUser("MOTHER");
    const { id, noteId } = await params;
    const note = await db.childNote.findFirst({
      where: { id: noteId, childId: id, motherId: user.id },
    });
    if (!note) throw new ApiError(404, "Note introuvable.");
    await db.childNote.delete({ where: { id: noteId } });
    return Response.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
