import { ChildForm } from "@/components/child-form";
export default function NewChild() {
  return (
    <>
      <span className="eyebrow">Nouveau profil</span>
      <h1 className="page-title mb-7 mt-2">Ajouter un enfant</h1>
      <ChildForm />
    </>
  );
}
