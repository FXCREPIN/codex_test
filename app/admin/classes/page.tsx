"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";

interface ClassRow {
  id: string;
  name: string;
  teachers: { id: string; name: string }[];
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [name, setName] = useState("");
  const [csvStatus, setCsvStatus] = useState<string | null>(null);

  const loadClasses = () => {
    fetch("/api/admin/classes")
      .then((response) => response.json())
      .then((data) => setClasses(data));
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetch("/api/admin/classes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name })
    });
    setName("");
    loadClasses();
  };

  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const response = await fetch("/api/admin/classes", {
      method: "POST",
      headers: { "content-type": "text/csv" },
      body: text
    });
    const data = await response.json();
    setCsvStatus(`Import terminé : ${data.created ?? 0} classe(s) ajoutée(s).`);
    loadClasses();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Classes" subtitle="Gérer les classes et assignations." />

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Ajouter une classe">
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              placeholder="Nom de la classe"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
              Ajouter
            </button>
          </form>
        </Card>
        <Card title="Importer un CSV">
          <div className="space-y-2">
            <p>Fichier CSV avec une seule colonne : nom de la classe.</p>
            <input type="file" accept=".csv" onChange={handleCsvImport} />
            {csvStatus ? <p className="text-xs text-slate-500">{csvStatus}</p> : null}
          </div>
        </Card>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">Liste des classes</div>
        <div className="divide-y divide-slate-100">
          {classes.map((clazz) => (
            <div key={clazz.id} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{clazz.name}</p>
                <p className="text-xs text-slate-500">
                  {clazz.teachers.length} professeur(s) assigné(s)
                </p>
              </div>
              <Link href={`/admin/classes/${clazz.id}`} className="text-sm font-semibold text-slate-900">
                Détails & assignations
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
