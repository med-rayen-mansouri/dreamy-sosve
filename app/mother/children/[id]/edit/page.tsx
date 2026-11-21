import { pageUser } from "@/lib/access";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ChildForm } from "@/components/child-form";
import { strings } from "@/lib/validation";
export default async function EditChild({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await pageUser("MOTHER");
  const { id } = await params;
  const child = await db.child.findFirst({ where: { id, motherId: user.id } });
  if (!child) notFound();
  const initial = {
    firstName: child.firstName,
    birthDate: child.birthDate.toISOString().slice(0, 10),
    avatar: child.avatar || "🌟",
    description: child.description || "",
    personalityTags: strings(child.personalityTags).join(", "),
    interests: strings(child.interests).join(", "),
    favoriteActivities: strings(child.favoriteActivities).join(", "),
    favoriteColors: strings(child.favoriteColors).join(", "),
    birthdayThemes: strings(child.birthdayThemes).join(", "),
    giftWishes: strings(child.giftWishes).join(", "),
    comfortPreferences: strings(child.comfortPreferences).join(", "),
    approvedPlanningSummary: child.approvedPlanningSummary || "",
  };
  return (
    <>
      <span className="eyebrow">Profil de {child.firstName}</span>
      <h1 className="page-title mb-7 mt-2">Modifier le profil</h1>
      <ChildForm id={id} initial={initial} />
    </>
  );
}
