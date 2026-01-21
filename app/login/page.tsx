"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Card from "@/components/Card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (result?.error) {
      setError("Identifiants invalides.");
      setLoading(false);
      return;
    }

    window.location.href = "/";
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center">
      <Card title="Connexion">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          <div className="text-xs text-slate-500">
            <p>Direction : direction@gmail.com / direction</p>
            <p>Professeur : professeur@gmail.com / professeur</p>
          </div>
        </form>
      </Card>
    </div>
  );
}
