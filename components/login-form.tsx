"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
const schema = z.object({ email: z.email(), password: z.string().min(1) });
type Values = z.infer<typeof schema>;
export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });
  return (
    <form
      className="card space-y-5"
      onSubmit={handleSubmit(async (values) => {
        setError("");
        try {
          const result = await signIn("credentials", {
            ...values,
            redirect: false,
          });
          if (result?.error) {
            setError("Identifiants incorrects ou compte inactif.");
            return;
          }
          const response = await fetch("/api/me");
          const data = await response.json();
          router.push(
            data.role === "ADMIN" ? "/admin/dashboard" : "/mother/dashboard",
          );
          router.refresh();
        } catch {
          setError("Connexion indisponible. Vérifiez le serveur et réessayez.");
        }
      })}
    >
      <div>
        <label htmlFor="email" className="label">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          className="field"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-[#1D3768]">
            Adresse e-mail invalide.
          </p>
        )}
      </div>
      <div>
        <label htmlFor="password" className="label">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="field"
          {...register("password")}
        />
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-[#E2556A]/10 p-3 text-sm text-[#1D3768]"
        >
          {error}
        </p>
      )}
      <button disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
