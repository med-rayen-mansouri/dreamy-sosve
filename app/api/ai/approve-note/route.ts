import { db } from "@/lib/db";
import { apiUser, ApiError, fail } from "@/lib/access";
import { organizedSchema } from "@/lib/ai";
import { strings } from "@/lib/validation";
import { z } from "zod";
export async function POST(request: Request) {
  try {
    const user = await apiUser("MOTHER");
    const { childId, suggestions } = z
      .object({ childId: z.string(), suggestions: organizedSchema })
      .parse(await request.json());
    const child = await db.child.findFirst({
      where: { id: childId, motherId: user.id },
    });
    if (!child) throw new ApiError(404, "Enfant introuvable.");
    const merge = (old: unknown, items: string[]) => [
      ...new Set([...strings(old), ...items]),
    ];
    const updated = await db.child.update({
      where: { id: childId },
      data: {
        interests: merge(child.interests, suggestions.interests),
        comfortPreferences: merge(
          child.comfortPreferences,
          suggestions.comfortPreferences,
        ),
        giftWishes: merge(child.giftWishes, suggestions.giftWishes),
        birthdayThemes: merge(child.birthdayThemes, suggestions.birthdayThemes),
      },
    });
    return Response.json(updated);
  } catch (e) {
    return fail(e);
  }
}
