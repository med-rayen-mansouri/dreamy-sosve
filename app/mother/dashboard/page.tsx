import Link from "next/link";
import { db } from "@/lib/db";
import { pageUser } from "@/lib/access";
import { age, dateFR, Empty, nextBirthday, Pill } from "@/components/shell";
import { ArrowRight, CalendarDays, Heart, Users } from "lucide-react";
export default async function Dashboard() {
  const user = await pageUser("MOTHER");
  const [children, events, pending] = await Promise.all([
    db.child.findMany({
      where: { motherId: user.id },
      orderBy: { firstName: "asc" },
    }),
    db.event.findMany({
      where: {
        participants: { some: { motherId: user.id } },
        status: { not: "DRAFT" },
        eventDate: { gte: new Date() },
      },
      orderBy: { eventDate: "asc" },
      take: 4,
    }),
    db.eventParticipant.count({
      where: {
        motherId: user.id,
        approvalStatus: "PENDING",
        event: { status: "AWAITING_APPROVAL" },
      },
    }),
  ]);
  const birthdays = [...children]
    .sort(
      (a, b) =>
        nextBirthday(a.birthDate).getTime() -
        nextBirthday(b.birthDate).getTime(),
    )
    .slice(0, 3);
  return (
    <>
      <span className="eyebrow">Votre espace</span>
      <h1 className="page-title mt-2">Bonjour {user.name.split(" ")[0]} 👋</h1>
      <p className="muted mt-2">
        Les petits détails qui rendent les grands moments uniques.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat icon={<Users />} value={children.length} label="Enfants suivis" />
        <Stat
          icon={<Heart />}
          value={birthdays.length}
          label="Prochains anniversaires"
        />
        <Stat
          icon={<CalendarDays />}
          value={pending}
          label="Accords en attente"
        />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Mes enfants</h2>
            <Link
              href="/mother/children"
              className="text-sm font-bold text-[#1D3768]"
            >
              Tout voir →
            </Link>
          </div>
          {children.length ? (
            <div className="space-y-3">
              {children.slice(0, 4).map((child) => (
                <Link
                  key={child.id}
                  href={`/mother/children/${child.id}`}
                  className="card flex items-center gap-4 hover:border-[#08A9E0]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#CFEAF5] text-xl">
                    {child.avatar || "🌟"}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{child.firstName}</p>
                    <p className="muted text-sm">{age(child.birthDate)} ans</p>
                  </div>
                  <ArrowRight size={18} />
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              text="Aucun enfant pour le moment."
              href="/mother/children/new"
              label="Ajouter un enfant"
            />
          )}
          <Link href="/mother/children/new" className="btn-primary mt-4">
            Ajouter un enfant
          </Link>
        </section>
        <section>
          <h2 className="mb-4 text-xl font-bold">À venir</h2>
          <div className="card">
            <h3 className="font-bold">Anniversaires</h3>
            <div className="mt-4 space-y-3">
              {birthdays.map((child) => (
                <div
                  key={child.id}
                  className="flex justify-between gap-3 border-b border-[#CFEAF5] pb-3 last:border-0"
                >
                  <span>{child.firstName}</span>
                  <Pill coral>{dateFR(nextBirthday(child.birthDate))}</Pill>
                </div>
              ))}
              {!birthdays.length && (
                <p className="muted text-sm">Aucun anniversaire à afficher.</p>
              )}
            </div>
            <Link
              href="/mother/birthdays"
              className="mt-4 inline-block text-sm font-bold text-[#1D3768]"
            >
              Voir les anniversaires →
            </Link>
          </div>
          <div className="card mt-4">
            <h3 className="font-bold">Événements</h3>
            <div className="mt-4 space-y-3">
              {events.map((event) => (
                <Link
                  href={`/mother/events/${event.id}`}
                  key={event.id}
                  className="flex justify-between gap-3 border-b border-[#CFEAF5] pb-3 last:border-0 hover:text-[#1D3768]"
                >
                  <span>{event.title}</span>
                  <span className="muted text-sm">
                    {dateFR(event.eventDate)}
                  </span>
                </Link>
              ))}
              {!events.length && (
                <p className="muted text-sm">Aucun événement à venir.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="card">
      <div className="text-[#08A9E0]">{icon}</div>
      <p className="mt-4 text-3xl font-bold text-[#E2556A]">{value}</p>
      <p className="muted text-sm">{label}</p>
    </div>
  );
}
