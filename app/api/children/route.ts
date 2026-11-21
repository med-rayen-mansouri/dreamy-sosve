import { db } from "@/lib/db";
import { apiUser, fail } from "@/lib/access";
import { childSchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await apiUser();
    const children = await db.child.findMany({
      where: user.role === "MOTHER" ? { motherId: user.id } : {},
      include: { mother: { select: { name: true } } },
      orderBy: { firstName: "asc" },
    });
    return Response.json(children);
  } catch (e) {
    return fail(e);
  }
}
export async function POST(request: Request) {
  try {
    const user = await apiUser("MOTHER");
    const input = childSchema.parse(await request.json());
    const child = await db.child.create({
      data: {
        ...input,
        motherId: user.id,
        birthDate: new Date(input.birthDate),
      },
    });
    return Response.json(child, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
