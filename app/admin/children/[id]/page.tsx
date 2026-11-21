import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ChildProfile } from "@/components/child-profile";
export default async function ChildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const child = await db.child.findUnique({ where: { id } });
  if (!child) notFound();
  return (
    <>
      <p className="eyebrow mb-3">
        Informations approuvées · Notes privées non accessibles
      </p>
      <ChildProfile child={child} />
    </>
  );
}
