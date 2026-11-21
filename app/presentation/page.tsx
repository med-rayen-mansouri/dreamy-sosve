import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { PresentationViewer } from "@/components/presentation-viewer";

export const metadata: Metadata = {
  title: "Présentation | Dreamy",
  description:
    "Découvrez la présentation Dreamy et téléchargez le diaporama PowerPoint.",
};

export default function PresentationPage() {
  return (
    <main className="min-h-screen bg-[#EFFAFF]">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-6">
        <Link
          href="/"
          aria-label="Dreamy, accueil"
          className="block w-36 shrink-0 sm:w-48"
        >
          <BrandLogo className="h-auto w-full" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D3768] hover:underline"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          <span>Accueil</span>
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-6 sm:px-6 sm:pt-10">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow">Présentation Dreamy</span>
            <h1 className="page-title mt-3">Découvrez notre projet</h1>
            <p className="muted mt-3 max-w-2xl">
              Parcourez les 7 diapositives, puis téléchargez le fichier
              PowerPoint.
            </p>
          </div>
          <a
            href="/presentation/download"
            className="btn-primary w-fit shrink-0"
          >
            <Download size={18} aria-hidden="true" />
            Télécharger la présentation
          </a>
        </div>

        <PresentationViewer />
      </section>
    </main>
  );
}
