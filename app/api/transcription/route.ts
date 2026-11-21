import { apiUser, ApiError, fail } from "@/lib/access";
import { db } from "@/lib/db";
import { transcribe } from "@/lib/ai";
import { parseBuffer } from "music-metadata";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const user = await apiUser("MOTHER");
    const form = await request.formData();
    const childId = form.get("childId");
    const file = form.get("file");
    const declaredDuration = Number(form.get("duration"));
    const language = form.get("language");
    if (
      typeof childId !== "string" ||
      !(await db.child.findFirst({ where: { id: childId, motherId: user.id } }))
    )
      throw new ApiError(404, "Enfant introuvable.");
    if (
      !(file instanceof File) ||
      !["audio/webm", "audio/mp4", "audio/ogg", "audio/wav", "audio/mpeg"].some(
        (type) => file.type.startsWith(type),
      ) ||
      file.size === 0 ||
      file.size > 10 * 1024 * 1024
    )
      throw new ApiError(
        400,
        "Audio invalide ou trop volumineux (10 Mo maximum).",
      );
    if (
      !Number.isFinite(declaredDuration) ||
      declaredDuration <= 0 ||
      declaredDuration > 90
    )
      throw new ApiError(400, "Enregistrement limité à 90 secondes.");
    let actualDuration: number | undefined;
    try {
      const metadata = await parseBuffer(
        new Uint8Array(await file.arrayBuffer()),
        { mimeType: file.type.split(";")[0] },
        { duration: true, skipCovers: true },
      );
      actualDuration = metadata.format.duration;
    } catch {
      throw new ApiError(400, "Le fichier audio ne peut pas être lu.");
    }
    if (
      !actualDuration ||
      !Number.isFinite(actualDuration) ||
      actualDuration > 90 ||
      Math.abs(actualDuration - declaredDuration) > 5
    )
      throw new ApiError(
        400,
        "Durée audio invalide ou supérieure à 90 secondes.",
      );
    if (language && language !== "fr" && language !== "ar")
      throw new ApiError(400, "Langue non prise en charge.");
    return Response.json({
      text: await transcribe(
        user.id,
        file,
        typeof language === "string" ? language : undefined,
      ),
    });
  } catch (e) {
    return fail(e);
  }
}
