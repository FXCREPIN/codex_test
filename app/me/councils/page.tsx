"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";

interface CouncilRow {
  id: string;
  className: string;
  startsAt: string;
  location?: string | null;
  myStatus: string;
  expected: number;
  present: number;
  quorumRequired: number;
  quorumOk: boolean;
}

export default function MyCouncilsPage() {
  const [councils, setCouncils] = useState<CouncilRow[]>([]);

  const loadCouncils = () => {
    fetch("/api/me/councils")
      .then((response) => response.json())
      .then((data) => setCouncils(data));
  };

  useEffect(() => {
    loadCouncils();
  }, []);

  const updateAttendance = async (councilId: string, status: "PRESENT" | "ABSENT") => {
    await fetch("/api/me/attendance", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ councilId, status })
    });
    loadCouncils();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Mes conseils" subtitle="Confirmez votre présence." />

      <div className="space-y-4">
        {councils.map((council) => {
          const badgeTone = council.myStatus === "PRESENT" ? "green" : council.myStatus === "ABSENT" ? "red" : "amber";
          const badgeLabel = council.myStatus === "PRESENT" ? "Présent" : council.myStatus === "ABSENT" ? "Indisponible" : "En attente";
          return (
            <div key={council.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {council.className} · {new Date(council.startsAt).toLocaleString("fr-FR")}
                  </p>
                  <p className="text-xs text-slate-500">Lieu : {council.location ?? "Non précisé"}</p>
                  <p className="text-xs text-slate-500">
                    Quorum {council.present}/{council.expected} (requis {council.quorumRequired})
                  </p>
                </div>
                <StatusBadge label={badgeLabel} tone={badgeTone} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateAttendance(council.id, "PRESENT")}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                >
                  Présent
                </button>
                <button
                  type="button"
                  onClick={() => updateAttendance(council.id, "ABSENT")}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white"
                >
                  Indisponible
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
