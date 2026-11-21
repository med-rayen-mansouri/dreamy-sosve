"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = Array.from(
  { length: 7 },
  (_, index) =>
    `/presentation-preview/slide-${String(index + 1).padStart(2, "0")}.jpg`,
);

export function PresentationViewer() {
  const [active, setActive] = useState(0);

  return (
    <section
      aria-label="Aperçu des diapositives"
      className="card overflow-hidden p-3 sm:p-5"
    >
      <div
        className="overflow-hidden rounded-xl bg-white shadow-sm"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight")
            setActive((current) => Math.min(current + 1, slides.length - 1));
          if (event.key === "ArrowLeft")
            setActive((current) => Math.max(current - 1, 0));
        }}
        tabIndex={0}
        aria-label="Diapositive affichée. Utilisez les flèches gauche et droite pour naviguer."
      >
        <Image
          src={slides[active]}
          alt={`Diapositive ${active + 1} sur ${slides.length} de la présentation Dreamy`}
          width={1600}
          height={900}
          sizes="(max-width: 1152px) 100vw, 1080px"
          className="h-auto w-full"
          priority={active === 0}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          className="btn-secondary gap-1 px-3 sm:gap-2 sm:px-5"
          onClick={() => setActive((current) => current - 1)}
          disabled={active === 0}
          aria-label="Diapositive précédente"
        >
          <ChevronLeft size={18} aria-hidden="true" />
          <span className="hidden sm:inline">Précédente</span>
        </button>
        <p className="text-sm font-semibold text-[#1D3768]" aria-live="polite">
          Diapositive {active + 1} / {slides.length}
        </p>
        <button
          type="button"
          className="btn-secondary gap-1 px-3 sm:gap-2 sm:px-5"
          onClick={() => setActive((current) => current + 1)}
          disabled={active === slides.length - 1}
          aria-label="Diapositive suivante"
        >
          <span className="hidden sm:inline">Suivante</span>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div
        className="mt-5 flex gap-3 overflow-x-auto pb-2"
        aria-label="Choisir une diapositive"
      >
        {slides.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Afficher la diapositive ${index + 1}`}
            aria-pressed={active === index}
            className={`w-28 shrink-0 overflow-hidden rounded-lg border-2 text-left transition sm:w-36 ${
              active === index
                ? "border-[#08A9E0]"
                : "border-transparent hover:border-[#CFEAF5]"
            }`}
          >
            <Image
              src={src}
              alt=""
              width={160}
              height={90}
              sizes="144px"
              className="h-auto w-full"
            />
            <span className="block bg-white px-2 py-1 text-xs font-semibold text-[#1D3768]">
              {index + 1} / {slides.length}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
