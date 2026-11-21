import { apiUser, fail } from "@/lib/access";
export async function GET() {
  try {
    const user = await apiUser();
    return Response.json(user);
  } catch (e) {
    return fail(e);
  }
}
