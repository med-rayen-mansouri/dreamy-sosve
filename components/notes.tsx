"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Pencil, Square, Sparkles, Trash2 } from "lucide-react";

type Note = {
  id: string;
  content: string;
  inputMethod: string;
  createdAt: string;
};
type Suggestions = {
  interests: string[];
  comfortPreferences: string[];
  giftWishes: string[];
  birthdayThemes: string[];
};
async function json(response: Response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Opération impossible.");
  return data;
}
export function Notes({ childId, notes }: { childId: string; notes: Note[] }) {
  const router = useRouter();
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [recording, setRecording] = useState(false);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [method, setMethod] = useState<"TEXT" | "VOICE">("TEXT");
  const [language, setLanguage] = useState("fr");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
      recorder.current?.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );
  async function start() {
    setError("");
    setAudio(null);
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError("L’enregistrement n’est pas disponible dans ce navigateur.");
      return;
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media;
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find(
        (type) => MediaRecorder.isTypeSupported(type),
      );
      const next = new MediaRecorder(
        media,
        mime ? { mimeType: mime } : undefined,
      );
      recorder.current = next;
      chunks.current = [];
      setSeconds(0);
      next.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      next.onstop = () => {
        setAudio(
          new Blob(chunks.current, { type: next.mimeType || "audio/webm" }),
        );
        media.getTracks().forEach((track) => track.stop());
        stream.current = null;
      };
      next.start();
      setRecording(true);
      timer.current = setInterval(
        () =>
          setSeconds((current) => {
            if (current >= 89) {
              next.stop();
              setRecording(false);
              if (timer.current) clearInterval(timer.current);
              return 90;
            }
            return current + 1;
          }),
        1000,
      );
    } catch {
      setError(
        "Microphone refusé ou indisponible. Vous pouvez écrire la note.",
      );
    }
  }
  function stop() {
    if (recorder.current?.state === "recording") recorder.current.stop();
    setRecording(false);
    if (timer.current) clearInterval(timer.current);
  }
  async function upload() {
    if (!audio) return;
    setBusy("transcription");
    setError("");
    try {
      const form = new FormData();
      form.set(
        "file",
        new File(
          [audio],
          `note.${audio.type.includes("mp4") ? "mp4" : "webm"}`,
          { type: audio.type },
        ),
      );
      form.set("childId", childId);
      form.set("duration", String(seconds));
      form.set("language", language);
      const data = await json(
        await fetch("/api/transcription", { method: "POST", body: form }),
      );
      setContent(data.text);
      setMethod("VOICE");
      setAudio(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transcription impossible.");
    } finally {
      setBusy("");
    }
  }
  async function save() {
    setBusy("save");
    setError("");
    try {
      await json(
        await fetch(
          editingId
            ? `/api/children/${childId}/notes/${editingId}`
            : `/api/children/${childId}/notes`,
          {
            method: editingId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content, inputMethod: method }),
          },
        ),
      );
      setContent("");
      setMethod("TEXT");
      setEditingId(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setBusy("");
    }
  }
  async function organize() {
    setBusy("organize");
    setError("");
    try {
      const data = await json(
        await fetch("/api/ai/organize-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childId, content }),
        }),
      );
      setSuggestions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "IA indisponible.");
    } finally {
      setBusy("");
    }
  }
  async function approve() {
    if (!suggestions) return;
    setBusy("approve");
    setError("");
    try {
      await json(
        await fetch("/api/ai/approve-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childId, suggestions }),
        }),
      );
      setSuggestions(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Validation impossible.");
    } finally {
      setBusy("");
    }
  }
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold">Notes de la maman</h2>
      <p className="muted mt-1 text-sm">
        Ces notes restent privées. Seules les informations que vous approuvez
        rejoignent le profil.
      </p>
      <div className="card mt-5">
        <label htmlFor="note" className="label">
          {editingId ? "Modifier la note" : "Nouvelle note"}
        </label>
        <textarea
          id="note"
          className="field"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Racontez une préférence, une envie ou une idée…"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {recording ? (
            <button type="button" className="btn-secondary" onClick={stop}>
              <Square size={16} /> Arrêter · {seconds}s / 90s
            </button>
          ) : (
            <button type="button" className="btn-secondary" onClick={start}>
              <Mic size={17} /> Enregistrer avec ma voix
            </button>
          )}
          <select
            aria-label="Langue de la dictée"
            className="field !w-auto"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="fr">Français</option>
            <option value="ar">Arabe</option>
          </select>
        </div>
        {recording && (
          <p role="status" className="mt-3 text-sm font-bold text-[#E2556A]">
            ● Enregistrement en cours
          </p>
        )}
        {audio && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-[#EFFAFF] p-4">
            <span className="text-sm">
              Enregistrement prêt ({seconds}s). L’audio sera envoyé à GroqCloud
              uniquement si vous lancez la transcription.
            </span>
            <button
              type="button"
              disabled={!!busy}
              onClick={upload}
              className="btn-primary"
            >
              {busy === "transcription" ? "Transcription…" : "Transcrire"}
            </button>
            <button
              type="button"
              onClick={() => setAudio(null)}
              className="btn-secondary"
            >
              Annuler
            </button>
          </div>
        )}
        <p className="muted mt-3 text-xs">
          La dictée utilise un service cloud tiers. Relisez et corrigez le texte
          avant de l’enregistrer. L’arabe tunisien est pris en charge au mieux
          des capacités du service.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={save}
            disabled={!content.trim() || !!busy}
            className="btn-primary"
          >
            {busy === "save"
              ? "Enregistrement…"
              : editingId
                ? "Enregistrer les modifications"
                : "Enregistrer la note"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditingId(null);
                setContent("");
                setMethod("TEXT");
              }}
            >
              Annuler
            </button>
          )}
          <button
            type="button"
            onClick={organize}
            disabled={!content.trim() || !!busy}
            className="btn-secondary"
          >
            <Sparkles size={17} />
            {busy === "organize" ? "Organisation…" : "Organiser avec l’IA"}
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-[#E2556A]/10 p-3 text-sm text-[#1D3768]"
          >
            {error}
          </p>
        )}
      </div>
      {suggestions && (
        <div className="card mt-4">
          <h3 className="text-lg font-bold">Suggestions à vérifier</h3>
          <p className="muted mt-1 text-sm">
            Modifiez les éléments ci-dessous, puis approuvez ou rejetez. Rien
            n’est ajouté automatiquement.
          </p>
          {(
            [
              ["interests", "Centres d’intérêt"],
              ["comfortPreferences", "Confort"],
              ["giftWishes", "Souhaits de cadeaux"],
              ["birthdayThemes", "Thèmes d’anniversaire"],
            ] as [keyof Suggestions, string][]
          ).map(([key, label]) => (
            <div className="mt-4" key={key}>
              <label htmlFor={`suggest-${key}`} className="label">
                {label}
              </label>
              <input
                id={`suggest-${key}`}
                className="field"
                value={suggestions[key].join(", ")}
                onChange={(e) =>
                  setSuggestions({
                    ...suggestions,
                    [key]: e.target.value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
          ))}
          <div className="mt-5 flex gap-3">
            <button className="btn-primary" disabled={!!busy} onClick={approve}>
              Approuver ces éléments
            </button>
            <button
              className="btn-secondary"
              onClick={() => setSuggestions(null)}
            >
              Rejeter
            </button>
          </div>
        </div>
      )}
      <div className="mt-5 space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="card">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wide text-[#1D3768]">
                {note.inputMethod === "VOICE" ? "Note dictée" : "Note écrite"} ·{" "}
                {new Date(note.createdAt).toLocaleDateString("fr-FR")}
              </span>
              <div className="flex gap-3">
                <button
                  aria-label="Modifier la note"
                  className="text-[#1D3768]"
                  onClick={() => {
                    setEditingId(note.id);
                    setContent(note.content);
                    setMethod(note.inputMethod === "VOICE" ? "VOICE" : "TEXT");
                    setError("");
                  }}
                >
                  <Pencil size={17} />
                </button>
                <button
                  aria-label="Supprimer la note"
                  className="text-[#1D3768]"
                  onClick={async () => {
                    if (!confirm("Supprimer cette note ?")) return;
                    try {
                      await json(
                        await fetch(
                          `/api/children/${childId}/notes/${note.id}`,
                          {
                            method: "DELETE",
                          },
                        ),
                      );
                      router.refresh();
                    } catch (e) {
                      setError(
                        e instanceof Error
                          ? e.message
                          : "Suppression impossible.",
                      );
                    }
                  }}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
            <p className="whitespace-pre-wrap">{note.content}</p>
          </div>
        ))}
        {!notes.length && (
          <p className="muted text-sm">Aucune note pour le moment.</p>
        )}
      </div>
    </section>
  );
}
