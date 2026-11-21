import { db } from "@/lib/db";
import { ApiError } from "@/lib/access";
import { z } from "zod";

const outage =
  "Le service IA est temporairement indisponible. Vous pouvez continuer votre travail manuellement.";
const rateLimited =
  "Le quota du service IA est atteint. Réessayez plus tard ou continuez manuellement.";
export const organizedSchema = z.object({
  interests: z.array(z.string().max(80)).max(15),
  comfortPreferences: z.array(z.string().max(120)).max(15),
  giftWishes: z.array(z.string().max(120)).max(15),
  birthdayThemes: z.array(z.string().max(120)).max(15),
});
export const birthdaySchema = z.object({
  theme: z.string().max(180),
  activities: z.array(z.string().max(180)).max(15),
  giftIdeas: z.array(z.string().max(180)).max(15),
  decorations: z.array(z.string().max(180)).max(15),
  accommodations: z.array(z.string().max(180)).max(15),
  checklist: z.array(z.string().max(180)).max(20),
  explanation: z.string().max(1000),
});
export const eventPlanSchema = z.object({
  activities: z.array(z.string().max(180)).max(15),
  materials: z.array(z.string().max(180)).max(15),
  sequence: z.array(z.string().max(180)).max(15),
  groupOrganization: z.string().max(1000),
  accommodations: z.array(z.string().max(180)).max(15),
  checklist: z.array(z.string().max(180)).max(20),
});

export async function quota(userId: string, kind: "llm" | "stt") {
  if (
    process.env.AI_ENABLED === "false" ||
    !process.env.GROQ_API_KEY ||
    process.env.GROQ_API_KEY === "YOUR_GROQ_API_KEY"
  )
    throw new ApiError(503, outage);
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  const count = await db.aiRequest.count({
    where: { userId, kind, createdAt: { gte: since } },
  });
  if (count >= (kind === "stt" ? 10 : 30))
    throw new ApiError(
      429,
      "Votre limite quotidienne de demandes IA est atteinte. Continuez manuellement ou réessayez demain.",
    );
  await db.aiRequest.create({ data: { userId, kind } });
}
export async function verifyModel(model: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok)
      throw new ApiError(
        response.status === 429 ? 429 : 503,
        response.status === 429 ? rateLimited : outage,
      );
    const payload = await response.json();
    if (
      !Array.isArray(payload.data) ||
      !payload.data.some((item: { id?: string }) => item.id === model)
    )
      throw new ApiError(503, outage);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(503, outage);
  } finally {
    clearTimeout(timeout);
  }
}
export async function generate<T>(
  userId: string,
  system: string,
  input: unknown,
  schema: z.ZodType<T>,
): Promise<T> {
  await quota(userId, "llm");
  const model = process.env.GROQ_LLM_MODEL || "openai/gpt-oss-20b";
  await verifyModel(model);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: JSON.stringify(input) },
          ],
        }),
        signal: controller.signal,
        cache: "no-store",
      },
    );
    if (!response.ok)
      throw new ApiError(
        response.status === 429 ? 429 : 503,
        response.status === 429 ? rateLimited : outage,
      );
    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string")
      throw new ApiError(
        502,
        "La réponse IA est incomplète. Réessayez ou continuez manuellement.",
      );
    const parsed = schema.safeParse(JSON.parse(content));
    if (!parsed.success)
      throw new ApiError(
        502,
        "La réponse IA ne peut pas être utilisée. Réessayez ou continuez manuellement.",
      );
    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof SyntaxError)
      throw new ApiError(
        502,
        "La réponse IA est invalide. Continuez manuellement.",
      );
    throw new ApiError(503, outage);
  } finally {
    clearTimeout(timeout);
  }
}
export async function transcribe(
  userId: string,
  file: File,
  language?: string,
) {
  await quota(userId, "stt");
  const model = process.env.GROQ_STT_MODEL || "whisper-large-v3-turbo";
  await verifyModel(model);
  const form = new FormData();
  form.set("file", file);
  form.set("model", model);
  form.set("response_format", "json");
  if (language) form.set("language", language);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        body: form,
        signal: controller.signal,
        cache: "no-store",
      },
    );
    if (!response.ok)
      throw new ApiError(
        response.status === 429 ? 429 : 503,
        response.status === 429 ? rateLimited : outage,
      );
    const data = await response.json();
    if (typeof data.text !== "string" || !data.text.trim())
      throw new ApiError(
        502,
        "Aucune parole reconnue. Réessayez ou saisissez la note.",
      );
    return data.text.trim() as string;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(503, outage);
  } finally {
    clearTimeout(timeout);
  }
}
