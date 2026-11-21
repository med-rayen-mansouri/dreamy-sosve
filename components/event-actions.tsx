"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
type Participant = {
  id: string;
  childId: string;
  approvalStatus: string;
  child: { firstName: string };
};
type Task = { id: string; title: string; completed: boolean };
type Feedback = { childId: string };
async function request(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Opération impossible.");
  return data;
}
export function EventActions({
  eventId,
  role,
  status,
  participants,
  tasks,
  feedback,
}: {
  eventId: string;
  role: "mother" | "admin";
  status: string;
  participants: Participant[];
  tasks: Task[];
  feedback: Feedback[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [comment, setComment] = useState<Record<string, string>>({});
  const [taskTitle, setTaskTitle] = useState("");
  const [feedbackValues, setFeedbackValues] = useState<
    Record<
      string,
      {
        enjoyed: boolean;
        comfortable: boolean;
        favoriteActivity: string;
        comment: string;
      }
    >
  >({});
  async function run(url: string, method: string, body?: unknown) {
    setBusy(true);
    setError("");
    try {
      await request(url, method, body);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Opération impossible.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="mt-6 space-y-5">
      {role === "admin" && !["COMPLETED", "CANCELLED"].includes(status) && (
        <>
          <div className="card">
            <h2 className="text-xl font-bold">Suivi du projet</h2>
            <p className="muted mt-1 text-sm">
              Demandez l’accord des mamans avant de confirmer.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {["DRAFT", "CHANGES_REQUESTED"].includes(status) && (
                <button
                  disabled={busy}
                  className="btn-primary"
                  onClick={() =>
                    run(`/api/events/${eventId}/status`, "POST", {
                      status: "AWAITING_APPROVAL",
                    })
                  }
                >
                  Demander les accords
                </button>
              )}
              {status === "AWAITING_APPROVAL" && (
                <button
                  disabled={busy}
                  className="btn-primary"
                  onClick={() =>
                    run(`/api/events/${eventId}/status`, "POST", {
                      status: "CONFIRMED",
                    })
                  }
                >
                  Confirmer l’événement
                </button>
              )}
              {status === "CONFIRMED" && (
                <button
                  disabled={busy}
                  className="btn-primary"
                  onClick={() =>
                    run(`/api/events/${eventId}/status`, "POST", {
                      status: "COMPLETED",
                    })
                  }
                >
                  Marquer comme terminé
                </button>
              )}
              {!["COMPLETED", "CANCELLED"].includes(status) && (
                <button
                  disabled={busy}
                  className="btn-secondary"
                  onClick={() => {
                    if (confirm("Annuler cet événement ?"))
                      run(`/api/events/${eventId}/status`, "POST", {
                        status: "CANCELLED",
                      });
                  }}
                >
                  Annuler
                </button>
              )}
              {status === "DRAFT" && (
                <button
                  disabled={busy}
                  className="btn-secondary"
                  onClick={() => {
                    if (confirm("Supprimer ce brouillon ?"))
                      run(`/api/events/${eventId}`, "DELETE").then(() =>
                        router.push("/admin/events"),
                      );
                  }}
                >
                  Supprimer le brouillon
                </button>
              )}
            </div>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold">Liste de préparation</h2>
            <div className="mt-4 space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3">
                  <input
                    aria-label={`Terminer ${task.title}`}
                    type="checkbox"
                    checked={task.completed}
                    disabled={busy}
                    onChange={(e) =>
                      run(`/api/events/${eventId}/tasks/${task.id}`, "PATCH", {
                        completed: e.target.checked,
                      })
                    }
                  />
                  <span className="flex-1">{task.title}</span>
                  <button
                    aria-label={`Supprimer ${task.title}`}
                    disabled={busy}
                    onClick={() =>
                      run(`/api/events/${eventId}/tasks/${task.id}`, "DELETE")
                    }
                    className="text-sm text-[#1D3768]"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                aria-label="Nouvelle tâche"
                className="field"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Nouvelle tâche"
              />
              <button
                disabled={busy || !taskTitle.trim()}
                className="btn-secondary"
                onClick={async () => {
                  await run(`/api/events/${eventId}/tasks`, "POST", {
                    title: taskTitle,
                  });
                  setTaskTitle("");
                }}
              >
                Ajouter
              </button>
            </div>
          </div>
        </>
      )}
      {role === "mother" && (
        <div className="card">
          <h2 className="text-xl font-bold">Votre avis</h2>
          {participants.map((p) => (
            <div key={p.id} className="mt-5 rounded-xl bg-[#EFFAFF] p-4">
              <p className="font-semibold">{p.child.firstName}</p>
              <p className="muted mt-1 text-sm">
                Statut :{" "}
                {p.approvalStatus === "PENDING"
                  ? "En attente"
                  : p.approvalStatus === "APPROVED"
                    ? "Approuvé"
                    : p.approvalStatus === "DECLINED"
                      ? "Refusé"
                      : "Modification demandée"}
              </p>
              {["AWAITING_APPROVAL", "CHANGES_REQUESTED"].includes(status) && (
                <>
                  <label className="label mt-3" htmlFor={`comment-${p.id}`}>
                    Votre message (facultatif)
                  </label>
                  <textarea
                    id={`comment-${p.id}`}
                    className="field"
                    rows={2}
                    value={comment[p.id] || ""}
                    onChange={(e) =>
                      setComment({ ...comment, [p.id]: e.target.value })
                    }
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      disabled={busy}
                      className="btn-primary"
                      onClick={() =>
                        run(
                          `/api/events/${eventId}/participants/${p.id}`,
                          "PATCH",
                          {
                            status: "APPROVED",
                            comment: comment[p.id] || null,
                          },
                        )
                      }
                    >
                      Approuver
                    </button>
                    <button
                      disabled={busy}
                      className="btn-secondary"
                      onClick={() =>
                        run(
                          `/api/events/${eventId}/participants/${p.id}`,
                          "PATCH",
                          {
                            status: "CHANGES_REQUESTED",
                            comment: comment[p.id] || null,
                          },
                        )
                      }
                    >
                      Demander un changement
                    </button>
                    <button
                      disabled={busy}
                      className="btn-secondary"
                      onClick={() =>
                        run(
                          `/api/events/${eventId}/participants/${p.id}`,
                          "PATCH",
                          {
                            status: "DECLINED",
                            comment: comment[p.id] || null,
                          },
                        )
                      }
                    >
                      Décliner
                    </button>
                  </div>
                </>
              )}
              {status === "COMPLETED" && (
                <div className="mt-4">
                  <h3 className="font-bold">Retour après l’événement</h3>
                  {feedback.some((f) => f.childId === p.childId) && (
                    <p className="muted text-sm">
                      Un retour est déjà enregistré. Vous pouvez le modifier.
                    </p>
                  )}
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="text-sm">
                      L’enfant a apprécié ?
                      <select
                        className="field mt-1"
                        value={String(
                          feedbackValues[p.childId]?.enjoyed ?? true,
                        )}
                        onChange={(e) =>
                          setFeedbackValues({
                            ...feedbackValues,
                            [p.childId]: {
                              enjoyed: e.target.value === "true",
                              comfortable:
                                feedbackValues[p.childId]?.comfortable ?? true,
                              favoriteActivity:
                                feedbackValues[p.childId]?.favoriteActivity ||
                                "",
                              comment: feedbackValues[p.childId]?.comment || "",
                            },
                          })
                        }
                      >
                        <option value="true">Oui</option>
                        <option value="false">Non</option>
                      </select>
                    </label>
                    <label className="text-sm">
                      L’enfant était à l’aise ?
                      <select
                        className="field mt-1"
                        value={String(
                          feedbackValues[p.childId]?.comfortable ?? true,
                        )}
                        onChange={(e) =>
                          setFeedbackValues({
                            ...feedbackValues,
                            [p.childId]: {
                              enjoyed:
                                feedbackValues[p.childId]?.enjoyed ?? true,
                              comfortable: e.target.value === "true",
                              favoriteActivity:
                                feedbackValues[p.childId]?.favoriteActivity ||
                                "",
                              comment: feedbackValues[p.childId]?.comment || "",
                            },
                          })
                        }
                      >
                        <option value="true">Oui</option>
                        <option value="false">Non</option>
                      </select>
                    </label>
                    <input
                      aria-label="Activité préférée"
                      className="field"
                      placeholder="Activité préférée"
                      value={feedbackValues[p.childId]?.favoriteActivity || ""}
                      onChange={(e) =>
                        setFeedbackValues({
                          ...feedbackValues,
                          [p.childId]: {
                            enjoyed: feedbackValues[p.childId]?.enjoyed ?? true,
                            comfortable:
                              feedbackValues[p.childId]?.comfortable ?? true,
                            favoriteActivity: e.target.value,
                            comment: feedbackValues[p.childId]?.comment || "",
                          },
                        })
                      }
                    />
                    <input
                      aria-label="Commentaire"
                      className="field"
                      placeholder="Commentaire"
                      value={feedbackValues[p.childId]?.comment || ""}
                      onChange={(e) =>
                        setFeedbackValues({
                          ...feedbackValues,
                          [p.childId]: {
                            enjoyed: feedbackValues[p.childId]?.enjoyed ?? true,
                            comfortable:
                              feedbackValues[p.childId]?.comfortable ?? true,
                            favoriteActivity:
                              feedbackValues[p.childId]?.favoriteActivity || "",
                            comment: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <button
                    disabled={busy}
                    className="btn-primary mt-3"
                    onClick={() =>
                      run(`/api/events/${eventId}/feedback`, "POST", {
                        childId: p.childId,
                        ...{
                          enjoyed: true,
                          comfortable: true,
                          favoriteActivity: "",
                          comment: "",
                        },
                        ...feedbackValues[p.childId],
                      })
                    }
                  >
                    Enregistrer le retour
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-[#E2556A]/10 p-3 text-[#1D3768]"
        >
          {error}
        </p>
      )}
    </section>
  );
}
