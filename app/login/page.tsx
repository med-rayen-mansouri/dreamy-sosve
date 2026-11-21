import { LoginForm } from "@/components/login-form";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";
export default function Login() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" aria-label="Dreamy, accueil" className="mx-auto block w-56">
            <BrandLogo className="h-auto w-full" />
          </Link>
          <h1 className="mt-6 page-title">Bienvenue</h1>
          <p className="muted mt-2">Connectez-vous à votre espace sécurisé.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
