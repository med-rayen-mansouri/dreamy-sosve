"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles } from "lucide-react";

type ChildOption = { id: string; firstName: string; motherName: string };
const schema = z.object({
  type: z.enum(["BIRTHDAY", "SOS_EVENT"]),
  title: z.string().trim().min(1),
  description: z.string(),
  category: z.string(),
  eventDate: z.string().min(1),
  location: z.string().trim().min(1),
  birthdayChildId: z.string(),
  theme: z.string(),
  plannedActivities: z.string(),
  suggestedGiftIdeas: z.string(),
  preparationNotes: z.string(),
  checklist: z.string(),
});
type Values = z.infer<typeof schema>;
const split = (value: string) =>
  value
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
async function parse(response: Response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Service indisponible.");
  return data;
}
export function EventForm({
  options,
  id,
  initial,
  selected = [],
}: {
  options: ChildOption[];
  id?: string;
  initial?: Partial<Values>;
  selected?: string[];
}) {
  const router = useRouter();
  const [childIds, setChildIds] = useState<string[]>(selected);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [aiNote, setAiNote] = useState("");
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "SOS_EVENT",
      title: "",
      description: "",
      category: "",
      eventDate: "",
      location: "",
      birthdayChildId: "",
      theme: "",
      plannedActivities: "",
      suggestedGiftIdeas: "",
      preparationNotes: "",
      checklist: "",
      ...initial,
    },
  });
  const type = useWatch({ control, name: "type" });
  const birthdayChildId = useWatch({ control, name: "birthdayChildId" });
  async function suggest() {
    setError("");
    setBusy("ai");
    try {
      if (type === "BIRTHDAY") {
        if (!birthdayChildId)
          throw new Error("Choisissez d’abord l’enfant à célébrer.");
        const result = await parse(
          await fetch("/api/ai/birthday-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ childId: birthdayChildId }),
          }),
        );
        setValue("theme", result.theme);
        setValue("plannedActivities", result.activities.join("\n"));
        setValue("suggestedGiftIdeas", result.giftIdeas.join("\n"));
        setValue(
          "preparationNotes",
          [
            result.explanation,
            ...result.decorations.map((v: string) => `Décoration : ${v}`),
            ...result.accommodations.map((v: string) => `Adaptation : ${v}`),
          ].join("\n"),
        );
        setValue("checklist", result.checklist.join("\n"));
      } else {
        if (!childIds.length) throw new Error("Choisissez au moins un enfant.");
        const result = await parse(
          await fetch("/api/ai/event-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: getValues("title"),
              category: getValues("category"),
              childIds,
            }),
          }),
        );
        setValue("plannedActivities", result.activities.join("\n"));
        setValue(
          "preparationNotes",
          [
            result.groupOrganization,
            ...result.sequence.map((v: string) => `Étape : ${v}`),
            ...result.materials.map((v: string) => `Matériel : ${v}`),
            ...result.accommodations.map((v: string) => `Adaptation : ${v}`),
          ].join("\n"),
        );
        setValue("checklist", result.checklist.join("\n"));
      }
      setAiNote(
        "Suggestions chargées dans le formulaire. Relisez et modifiez avant d’enregistrer.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suggestions indisponibles.");
    } finally {
      setBusy("");
    }
  }
  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (values) => {
        setError("");
        try {
          if (
            values.type === "BIRTHDAY" &&
            !childIds.includes(values.birthdayChildId)
          )
            throw new Error("L’enfant fêté doit participer.");
          const body = {
            ...values,
            eventDate: new Date(values.eventDate).toISOString(),
            description: values.description || null,
            category: values.category || null,
            birthdayChildId:
              values.type === "BIRTHDAY" ? values.birthdayChildId : null,
            theme: values.theme || null,
            plannedActivities: split(values.plannedActivities),
            suggestedGiftIdeas: split(values.suggestedGiftIdeas),
            preparationNotes: values.preparationNotes || null,
            checklist: split(values.checklist),
            childIds,
          };
          const result = await parse(
            await fetch(id ? `/api/events/${id}` : "/api/events", {
              method: id ? "PUT" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            }),
          );
          router.push(`/admin/events/${id || result.id}`);
          router.refresh();
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "Enregistrement impossible.",
          );
        }
      })}
    >
      <div className="card">
        <h2 className="text-xl font-bold">Informations essentielles</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="type" className="label">
              Type
            </label>
            <select id="type" className="field" {...register("type")}>
              <option value="SOS_EVENT">Événement collectif SOS</option>
              <option value="BIRTHDAY">Anniversaire</option>
            </select>
          </div>
          <div>
            <label htmlFor="title" className="label">
              Titre *
            </label>
            <input id="title" className="field" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-[#1D3768]">Titre requis.</p>
            )}
          </div>
          <div>
            <label htmlFor="eventDate" className="label">
              Date et heure *
            </label>
            <input
              id="eventDate"
              type="datetime-local"
              className="field"
              {...register("eventDate")}
            />
          </div>
          <div>
            <label htmlFor="location" className="label">
              Lieu *
            </label>
            <input id="location" className="field" {...register("location")} />
          </div>
          <div>
            <label htmlFor="category" className="label">
              Catégorie
            </label>
            <input
              id="category"
              className="field"
              placeholder="Atelier créatif, sortie culturelle…"
              {...register("category")}
            />
          </div>
          {type === "BIRTHDAY" && (
            <div>
              <label htmlFor="birthdayChildId" className="label">
                Enfant fêté *
              </label>
              <select
                id="birthdayChildId"
                className="field"
                {...register("birthdayChildId")}
              >
                <option value="">Choisir</option>
                {options.map((child) => (
                  <option value={child.id} key={child.id}>
                    {child.firstName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="mt-5">
          <label htmlFor="description" className="label">
            Description
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
        <h2 className="text-xl font-bold">Enfants participants</h2>
        <p className="muted mt-1 text-sm">
          Leur maman pourra donner son accord lorsque vous lui soumettrez le
          projet.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((child) => (
            <label
              key={child.id}
              className="flex items-center gap-3 rounded-xl border border-[#CFEAF5] p-3"
            >
              <input
                type="checkbox"
                checked={childIds.includes(child.id)}
                onChange={(e) =>
                  setChildIds(
                    e.target.checked
                      ? [...childIds, child.id]
                      : childIds.filter((id) => id !== child.id),
                  )
                }
              />
              <span>
                <strong>{child.firstName}</strong>
                <span className="muted block text-xs">{child.motherName}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Préparation</h2>
            <p className="muted mt-1 text-sm">
              Chaque suggestion IA est modifiable et nécessite votre validation.
            </p>
          </div>
          <button
            type="button"
            onClick={suggest}
            disabled={!!busy}
            className="btn-secondary"
          >
            <Sparkles size={17} />
            {busy
              ? "Génération…"
              : type === "BIRTHDAY"
                ? "Suggérer un anniversaire"
                : "Générer des activités avec l’IA"}
          </button>
        </div>
        {aiNote && (
          <p role="status" className="mt-4 rounded-xl bg-[#CFEAF5] p-3 text-sm">
            {aiNote}
          </p>
        )}
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {type === "BIRTHDAY" && (
            <div>
              <label htmlFor="theme" className="label">
                Thème
              </label>
              <input id="theme" className="field" {...register("theme")} />
            </div>
          )}
          <div>
            <label htmlFor="plannedActivities" className="label">
              Activités (une par ligne)
            </label>
            <textarea
              id="plannedActivities"
              rows={5}
              className="field"
              {...register("plannedActivities")}
            />
          </div>
          {type === "BIRTHDAY" && (
            <div>
              <label htmlFor="suggestedGiftIdeas" className="label">
                Idées de cadeaux (une par ligne)
              </label>
              <textarea
                id="suggestedGiftIdeas"
                rows={5}
                className="field"
                {...register("suggestedGiftIdeas")}
              />
            </div>
          )}
          <div>
            <label htmlFor="checklist" className="label">
              Liste de préparation (une tâche par ligne)
            </label>
            <textarea
              id="checklist"
              rows={5}
              className="field"
              {...register("checklist")}
            />
          </div>
          <div>
            <label htmlFor="preparationNotes" className="label">
              Notes de préparation
            </label>
            <textarea
              id="preparationNotes"
              rows={5}
              className="field"
              {...register("preparationNotes")}
            />
          </div>
        </div>
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
            : "Créer le brouillon"}
      </button>
    </form>
  );
}
