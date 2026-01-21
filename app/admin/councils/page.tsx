"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";

interface CouncilRow {
  id: string;
  classId: string;
  className: string;
  startsAt: string;
  location?: string | null;
  expected: number;
  present: number;
  quorumRequired: number;
  quorumOk: boolean;
}

interface ClassRow {
  id: string;
  name: string;
}

export default function CouncilsPage() {
  const [councils, setCouncils] = useState<CouncilRow[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [classId, setClassId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [location, setLocation] = useState("");

  const loadData = async () => {
    const [councilResponse, classesResponse] = await Promise.all([
      fetch("/api/admin/councils"),
      fetch("/api/admin/classes")
    ]);
    setCouncils(await councilResponse.json());
    setClasses(await classesResponse.json());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetch("/api/admin/councils", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ classId, startsAt, location })
    });
    setClassId("");
    setStartsAt("");
    setLocation("");
    loadData();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Conseils de classe" subtitle="Créer et suivre les conseils." />

      <Card title="Créer un conseil">
        <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-3">
          <select
            className="rounded-lg border border-slate-200 px-3 py-2"
            value={classId}
            onChange={(event) => setClassId(event.target.value)}
            required
          >
            <option value="">Classe</option>
            {classes.map((clazz) => (
              <option key={clazz.id} value={clazz.id}>
                {clazz.name}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            className="rounded-lg border border-slate-200 px-3 py-2"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            required
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Lieu"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
          <div>
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
              Ajouter
            </button>
          </div>
        </form>
      </Card>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">Liste des conseils</div>
        <div className="divide-y divide-slate-100">
          {councils.map((council) => (
            <div key={council.id} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {council.className} · {new Date(council.startsAt).toLocaleString("fr-FR")}
                </p>
                <p className="text-xs text-slate-500">Lieu : {council.location ?? "Non précisé"}</p>
                <p className="text-xs text-slate-500">
                  Présents {council.present}/{council.expected} · quorum {council.quorumRequired}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge label={council.quorumOk ? "OK" : "RISQUE"} tone={council.quorumOk ? "green" : "amber"} />
                <Link href={`/admin/councils/${council.id}`} className="text-sm font-semibold">
                  Détails
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
