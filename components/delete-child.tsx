"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function DeleteChild({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button
        disabled={busy}
        className="btn-secondary text-[#1D3768]"
        onClick={async () => {
          if (!confirm("Supprimer définitivement ce profil et ses notes ?"))
            return;
          setBusy(true);
          setError("");
          try {
            const response = await fetch(`/api/children/${id}`, {
              method: "DELETE",
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            router.push("/mother/children");
            router.refresh();
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Suppression impossible.",
            );
            setBusy(false);
          }
        }}
      >
        Supprimer le profil
      </button>
      {error && (
        <p role="alert" className="text-sm text-[#1D3768]">
          {error}
        </p>
      )}
    </>
  );
}
