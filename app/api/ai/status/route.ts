import { apiUser, fail } from "@/lib/access";
import { verifyModel } from "@/lib/ai";
export async function GET() {
  try {
    await apiUser();
    if (process.env.AI_ENABLED === "false" || !process.env.GROQ_API_KEY)
      return Response.json({
        available: false,
        reason: "Clé Groq absente ou IA désactivée.",
      });
    const llm = process.env.GROQ_LLM_MODEL || "openai/gpt-oss-20b";
    const stt = process.env.GROQ_STT_MODEL || "whisper-large-v3-turbo";
    try {
      await Promise.all([verifyModel(llm), verifyModel(stt)]);
      return Response.json({ available: true, llm, stt });
    } catch {
      return Response.json({
        available: false,
        reason: "Modèle indisponible pour ce compte ou service inaccessible.",
      });
    }
  } catch (e) {
    return fail(e);
  }
}
