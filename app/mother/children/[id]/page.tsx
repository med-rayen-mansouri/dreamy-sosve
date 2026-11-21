import Link from "next/link";
import { pageUser } from "@/lib/access";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ChildProfile } from "@/components/child-profile";
import { Notes } from "@/components/notes";
import { DeleteChild } from "@/components/delete-child";
export default async function ChildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await pageUser("MOTHER");
  const { id } = await params;
  const child = await db.child.findFirst({
    where: { id, motherId: user.id },
    include: { notes: { orderBy: { createdAt: "desc" } } },
  });
  if (!child) notFound();
  return (
    <>
      <div className="mb-5 flex flex-wrap justify-end gap-3">
        <DeleteChild id={id} />
        <Link href={`/mother/children/${id}/edit`} className="btn-secondary">
          Modifier le profil
        </Link>
      </div>
      <ChildProfile child={child} />
      <Notes
        childId={id}
        notes={child.notes.map((note) => ({
          id: note.id,
          content: note.content,
          inputMethod: note.inputMethod,
          createdAt: note.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
