"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Card from "@/components/Card";

export default function HomePage() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Conseils de classe</h1>
        <p className="text-slate-600">
          Suivi des présences et quorum minimal pour chaque conseil de classe.
        </p>
      </header>

      {!session ? (
        <Card title="Connexion">
          <p>Veuillez vous connecter pour accéder à votre espace.</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-white"
          >
            Se connecter
          </Link>
        </Card>
      ) : (
        <Card title={`Bienvenue ${session.user?.name ?? ""}`}>
          <p>Vous êtes connecté en tant que {role === "ADMIN" ? "direction" : "professeur"}.</p>
          <div className="flex flex-wrap gap-2">
            {role === "ADMIN" ? (
              <Link
                href="/admin/dashboard"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Aller au dashboard
              </Link>
            ) : (
              <Link
                href="/me/councils"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Voir mes conseils
              </Link>
            )}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold"
            >
              Se déconnecter
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
