import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

export async function currentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
}
export async function pageUser(role: Role) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!user.active || user.role !== role) redirect("/unauthorized");
  return user;
}
export async function apiUser(role?: Role) {
  const user = await currentUser();
  if (!user?.active) throw new ApiError(401, "Connexion requise.");
  if (role && user.role !== role) throw new ApiError(403, "Accès refusé.");
  return user;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function fail(error: unknown) {
  if (error instanceof ApiError)
    return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof Error && error.name === "ZodError")
    return Response.json(
      { error: "Vérifiez les informations saisies." },
      { status: 400 },
    );
  console.error(
    "Request failed",
    error instanceof Error ? error.name : "unknown",
  );
  return Response.json(
    { error: "Une erreur est survenue. Réessayez." },
    { status: 500 },
  );
}
