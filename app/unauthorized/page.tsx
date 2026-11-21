import Link from "next/link";
export default function Unauthorized() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="card max-w-md text-center">
        <h1 className="page-title">Accès refusé</h1>
        <p className="muted mt-3">
          Cet espace n’est pas associé à votre compte.
        </p>
        <Link href="/login" className="btn-primary mt-6">
          Revenir à la connexion
        </Link>
      </div>
    </main>
  );
}
