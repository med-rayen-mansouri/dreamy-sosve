"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(80),
  birthDate: z.string().min(1, "Date requise"),
  avatar: z.string(),
  description: z.string(),
  personalityTags: z.string(),
  interests: z.string(),
  favoriteActivities: z.string(),
  favoriteColors: z.string(),
  birthdayThemes: z.string(),
  giftWishes: z.string(),
  comfortPreferences: z.string(),
  approvedPlanningSummary: z.string(),
});
type Values = z.infer<typeof schema>;
const fields: [keyof Values, string, string][] = [
  ["personalityTags", "Personnalité", "Curieux, calme"],
  ["interests", "Centres d’intérêt", "Dessin, animaux"],
  ["favoriteActivities", "Activités préférées", "Peinture, lecture"],
  ["favoriteColors", "Couleurs préférées", "Bleu, vert"],
  ["birthdayThemes", "Thèmes d’anniversaire", "Nature, espace"],
  ["giftWishes", "Souhaits de cadeaux", "Crayons de couleur"],
  [
    "comfortPreferences",
    "Préférences de confort",
    "Petits groupes, endroit calme",
  ],
];
const split = (value: string) => [
  ...new Set(
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  ),
];
export function ChildForm({
  id,
  initial,
}: {
  id?: string;
  initial?: Partial<Values>;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      birthDate: "",
      avatar: "🌟",
      description: "",
      personalityTags: "",
      interests: "",
      favoriteActivities: "",
      favoriteColors: "",
      birthdayThemes: "",
      giftWishes: "",
      comfortPreferences: "",
      approvedPlanningSummary: "",
      ...initial,
    },
  });
  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (values) => {
        setError("");
        try {
          const body = {
            ...values,
            avatar: values.avatar || null,
            description: values.description || null,
            approvedPlanningSummary: values.approvedPlanningSummary || null,
            ...Object.fromEntries(
              fields.map(([key]) => [key, split(values[key])]),
            ),
          };
          const response = await fetch(
            id ? `/api/children/${id}` : "/api/children",
            {
              method: id ? "PUT" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            },
          );
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          router.push(`/mother/children/${id || data.id}`);
          router.refresh();
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "Enregistrement impossible.",
          );
        }
      })}
    >
      <div className="card">
        <h2 className="mb-5 text-xl font-bold">Informations de base</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="label">
              Prénom *
            </label>
            <input
              id="firstName"
              className="field"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-sm text-[#1D3768]">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="birthDate" className="label">
              Date de naissance *
            </label>
            <input
              id="birthDate"
              type="date"
              className="field"
              {...register("birthDate")}
            />
            {errors.birthDate && (
              <p className="text-sm text-[#1D3768]">
                {errors.birthDate.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="avatar" className="label">
              Avatar fictif (emoji)
            </label>
            <input
              id="avatar"
              className="field"
              maxLength={4}
              {...register("avatar")}
            />
          </div>
        </div>
        <div className="mt-5">
          <label htmlFor="description" className="label">
            Présentation
          </label>
          <textarea
            id="description"
            rows={3}
            className="field"
            {...register("description")}
          />
        </div>
      </div>
      <div className="card">
        <h2 className="mb-2 text-xl font-bold">Personnalité et envies</h2>
        <p className="muted mb-5 text-sm">
          Séparez plusieurs éléments par une virgule. Tous ces champs sont
          facultatifs.
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          {fields.map(([key, label, placeholder]) => (
            <div key={key}>
              <label htmlFor={key} className="label">
                {label}
              </label>
              <input
                id={key}
                className="field"
                placeholder={placeholder}
                {...register(key)}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <label htmlFor="approvedPlanningSummary" className="label">
          Résumé approuvé pour les organisateurs
        </label>
        <p className="muted mb-3 text-sm">
          Partagez seulement les informations utiles à la préparation. Les notes
          privées restent dans votre espace.
        </p>
        <textarea
          id="approvedPlanningSummary"
          rows={4}
          className="field"
          {...register("approvedPlanningSummary")}
        />
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-[#E2556A]/10 p-3 text-[#1D3768]"
        >
          {error}
        </p>
      )}
      <button disabled={isSubmitting} className="btn-primary">
        {isSubmitting
          ? "Enregistrement…"
          : id
            ? "Enregistrer les modifications"
            : "Créer le profil"}
      </button>
    </form>
  );
}
