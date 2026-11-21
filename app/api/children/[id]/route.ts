import { db } from "@/lib/db";
import { apiUser, ApiError, fail } from "@/lib/access";
import { childSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: Context) {
  try {
    const user = await apiUser();
    const { id } = await params;
    const child = await db.child.findUnique({
      where: { id },
      include:
        user.role === "MOTHER"
          ? { notes: { orderBy: { createdAt: "desc" } } }
          : undefined,
    });
    if (!child || (user.role === "MOTHER" && child.motherId !== user.id))
      throw new ApiError(404, "Enfant introuvable.");
    return Response.json(child);
  } catch (e) {
    return fail(e);
  }
}
export async function PUT(request: Request, { params }: Context) {
  try {
    const user = await apiUser("MOTHER");
    const { id } = await params;
    const existing = await db.child.findFirst({
      where: { id, motherId: user.id },
    });
    if (!existing) throw new ApiError(404, "Enfant introuvable.");
    const input = childSchema.parse(await request.json());
    const child = await db.child.update({
      where: { id },
      data: { ...input, birthDate: new Date(input.birthDate) },
    });
    return Response.json(child);
  } catch (e) {
    return fail(e);
  }
}
export async function DELETE(_: Request, { params }: Context) {
  try {
    const user = await apiUser("MOTHER");
    const { id } = await params;
    const child = await db.child.findFirst({
      where: { id, motherId: user.id },
    });
    if (!child) throw new ApiError(404, "Enfant introuvable.");
    await db.child.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
