import { db } from "@/lib/db";
import { apiUser, ApiError, fail } from "@/lib/access";
import { noteSchema } from "@/lib/validation";
type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, { params }: Context) {
  try {
    const user = await apiUser("MOTHER");
    const { id } = await params;
    const child = await db.child.findFirst({
      where: { id, motherId: user.id },
    });
    if (!child) throw new ApiError(404, "Enfant introuvable.");
    const input = noteSchema.parse(await request.json());
    const note = await db.childNote.create({
      data: { childId: id, motherId: user.id, ...input },
    });
    return Response.json(note, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
