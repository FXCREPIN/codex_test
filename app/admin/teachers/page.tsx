"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";

interface TeacherRow {
  id: string;
  email: string;
  name: string;
  subjects?: string;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [form, setForm] = useState({ email: "", name: "", subjects: "" });

  const loadTeachers = () => {
    fetch("/api/admin/teachers")
      .then((response) => response.json())
      .then((data) => setTeachers(data));
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form)
    });
    setForm({ email: "", name: "", subjects: "" });
    loadTeachers();
  };

  const handleUpdate = async (teacher: TeacherRow) => {
    await fetch(`/api/admin/teachers/${teacher.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(teacher)
    });
    loadTeachers();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Professeurs" subtitle="Créer et mettre à jour les informations." />

      <Card title="Ajouter un professeur">
        <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-3">
          <input
            className="rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Nom"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Matières"
            value={form.subjects}
            onChange={(event) => setForm({ ...form, subjects: event.target.value })}
          />
          <div>
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
              Ajouter
            </button>
          </div>
        </form>
        <p className="text-xs text-slate-500">Mot de passe par défaut : professeur</p>
      </Card>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
          Liste des professeurs
        </div>
        <div className="divide-y divide-slate-100">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div className="grid gap-2 md:grid-cols-3">
                <input
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
                  value={teacher.name}
                  onChange={(event) => {
                    const next = teachers.map((item) =>
                      item.id === teacher.id ? { ...item, name: event.target.value } : item
                    );
                    setTeachers(next);
                  }}
                />
                <input
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
                  value={teacher.email}
                  onChange={(event) => {
                    const next = teachers.map((item) =>
                      item.id === teacher.id ? { ...item, email: event.target.value } : item
                    );
                    setTeachers(next);
                  }}
                />
                <input
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
                  value={teacher.subjects ?? ""}
                  onChange={(event) => {
                    const next = teachers.map((item) =>
                      item.id === teacher.id ? { ...item, subjects: event.target.value } : item
                    );
                    setTeachers(next);
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleUpdate(teacher)}
                className="text-sm font-semibold text-slate-900"
              >
                Mettre à jour
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
