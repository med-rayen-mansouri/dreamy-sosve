import Link from "next/link";
import {
  ArrowRight,
  CalendarHeart,
  HeartHandshake,
  Mic2,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#EFFAFF]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-[#1D3768]"
        >
          Petits <span className="text-[#08A9E0]">Mondes</span>
        </Link>
        <Link href="/login" className="btn-primary">
          Se connecter <ArrowRight size={18} />
        </Link>
      </header>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-16 lg:grid-cols-2 lg:pt-28">
        <div>
          <span className="eyebrow">SOS ISIMM · Latino Impact</span>
          <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-[#1D3768] md:text-6xl">
            Chaque enfant a son univers.{" "}
            <span className="text-[#08A9E0]">
              Chaque événement mérite d’être spécial.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#1D3768]/80">
            Un espace de confiance pour connaître les envies des enfants,
            préparer des anniversaires attentionnés et organiser les événements
            SOS avec leurs mamans.
          </p>
          <Link href="/login" className="btn-primary mt-9 inline-flex">
            Accéder à mon espace <ArrowRight size={19} />
          </Link>
        </div>
        <div className="rounded-[2.5rem] bg-white p-6 shadow-xl shadow-[#1D3768]/10 md:p-9">
          <div className="rounded-3xl bg-[#CFEAF5] p-7">
            <div className="mb-7 flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3 text-[#08A9E0]">
                <CalendarHeart />
              </div>
              <div>
                <p className="font-bold text-[#1D3768]">
                  Des moments à leur image
                </p>
                <p className="text-sm text-[#1D3768]/70">
                  Préparés ensemble, en toute confiance
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Feature
                icon={<HeartHandshake />}
                title="Profils attentionnés"
                text="Envies, intérêts et besoins de confort."
              />
              <Feature
                icon={<Mic2 />}
                title="Notes vocales"
                text="Une idée racontée, transcrite puis relue."
              />
              <Feature
                icon={<Sparkles />}
                title="Suggestions utiles"
                text="L’IA propose, les personnes décident."
              />
              <Feature
                icon={<CalendarHeart />}
                title="Événements partagés"
                text="Des projets validés avec les mamans."
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5">
      <div className="mb-3 text-[#08A9E0]">{icon}</div>
      <h2 className="font-semibold text-[#1D3768]">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-[#1D3768]/70">{text}</p>
    </div>
  );
}
