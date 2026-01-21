"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import Card from "@/components/Card";
import Link from "next/link";

interface CouncilRow {
  id: string;
  className: string;
  startsAt: string;
  location?: string | null;
  expected: number;
  present: number;
  quorumRequired: number;
  quorumOk: boolean;
}

export default function AdminDashboardPage() {
  const [councils, setCouncils] = useState<CouncilRow[]>([]);

  useEffect(() => {
    fetch("/api/admin/councils")
      .then((response) => response.json())
      .then((data) => setCouncils(data));
  }, []);

  const upcoming = councils.filter((council) => new Date(council.startsAt) >= new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Suivi des conseils à venir et du quorum minimal."
        actions={
          <Link
            href="/admin/councils"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Gérer les conseils
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Conseils à venir">
          <p className="text-3xl font-semibold text-slate-900">{upcoming.length}</p>
          <p className="text-sm text-slate-500">Conseils programmés</p>
        </Card>
        <Card title="Risque de quorum">
          <p className="text-3xl font-semibold text-slate-900">
            {upcoming.filter((council) => !council.quorumOk).length}
          </p>
          <p className="text-sm text-slate-500">Conseils sous le seuil de 70%</p>
        </Card>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
          Conseils à venir
        </div>
        <div className="divide-y divide-slate-100">
          {upcoming.map((council) => (
            <div key={council.id} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {council.className} · {new Date(council.startsAt).toLocaleString("fr-FR")}
                </p>
                <p className="text-xs text-slate-500">Lieu : {council.location ?? "Non précisé"}</p>
                <p className="text-xs text-slate-500">
                  Présents {council.present}/{council.expected} (quorum requis {council.quorumRequired})
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge label={council.quorumOk ? "OK" : "RISQUE"} tone={council.quorumOk ? "green" : "red"} />
                <Link
                  href={`/admin/councils/${council.id}`}
                  className="text-sm font-semibold text-slate-900"
                >
                  Détail
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
