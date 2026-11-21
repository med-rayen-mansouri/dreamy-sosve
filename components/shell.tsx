import Link from "next/link";
import {
  CalendarDays,
  Heart,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import { signOut } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";

export function Shell({
  role,
  name,
  children,
}: {
  role: "MOTHER" | "ADMIN";
  name: string;
  children: React.ReactNode;
}) {
  const base = role === "MOTHER" ? "/mother" : "/admin";
  const links = [
    {
      href: `${base}/dashboard`,
      label: "Tableau de bord",
      icon: LayoutDashboard,
    },
    { href: `${base}/children`, label: "Enfants", icon: Users },
    { href: `${base}/birthdays`, label: "Anniversaires", icon: Heart },
    { href: `${base}/events`, label: "Événements", icon: CalendarDays },
  ];
  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-[#CFEAF5] bg-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-6 lg:block">
          <Link href="/" aria-label="Dreamy, accueil" className="block w-40 lg:w-48">
            <BrandLogo className="h-auto w-full" />
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E2556A] lg:mt-2 lg:block">
            {role === "MOTHER" ? "Espace maman" : "Espace organisation"}
          </span>
        </div>
        <nav
          className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col"
          aria-label="Navigation principale"
        >
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 font-semibold text-[#1D3768] hover:bg-[#EFFAFF] focus-visible:bg-[#EFFAFF]"
            >
              <Icon size={19} className="text-[#08A9E0]" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-[#CFEAF5] px-5 py-4 lg:py-5">
          <p className="font-semibold">{name}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="mt-2 flex items-center gap-2 text-sm text-[#1D3768] hover:text-[#1D3768]">
              <LogOut size={16} /> Déconnexion
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-9 md:py-11">
          {children}
          <div className="mt-12 border-t border-[#CFEAF5] pt-5 text-xs text-[#1D3768]">
            Données fictives de démonstration · Les suggestions IA requièrent
            une validation humaine.
          </div>
        </div>
      </div>
    </div>
  );
}
export function Empty({
  text,
  href,
  label,
}: {
  text: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="card text-center">
      <p className="muted">{text}</p>
      {href && label && (
        <Link className="btn-primary mt-4" href={href}>
          {label}
        </Link>
      )}
    </div>
  );
}
export function Pill({
  children,
  coral = false,
}: {
  children: React.ReactNode;
  coral?: boolean;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${coral ? "bg-[#E2556A]/10 text-[#1D3768]" : "bg-[#CFEAF5] text-[#1D3768]"}`}
    >
      {children}
    </span>
  );
}
export function dateFR(date: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}
export function age(date: Date | string) {
  const birth = new Date(date),
    now = new Date();
  let value = now.getFullYear() - birth.getFullYear();
  if (
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  )
    value--;
  return value;
}
export function nextBirthday(date: Date) {
  const today = new Date();
  const next = new Date(
    today.getFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate()))
    next.setFullYear(next.getFullYear() + 1);
  return next;
}
