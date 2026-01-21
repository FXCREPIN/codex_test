"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import Link from "next/link";

interface TeacherOption {
  id: string;
  name: string;
}

interface ClassDetail {
  id: string;
  name: string;
  teachers: { teacher: { id: string; teacherProfile?: { name: string | null } | null; email: string } }[];
  councils: { id: string; startsAt: string; location?: string | null }[];
}

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params.classId as string;
  const [clazz, setClazz] = useState<ClassDetail | null>(null);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [name, setName] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const loadData = async () => {
    const [classResponse, teachersResponse] = await Promise.all([
      fetch(`/api/admin/classes/${classId}`),
      fetch("/api/admin/teachers")
    ]);
    const classData = await classResponse.json();
    const teachersData = await teachersResponse.json();
    setClazz(classData);
    setName(classData.name);
    setTeachers(teachersData);
  };

  useEffect(() => {
    loadData();
  }, [classId]);

  const handleRename = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetch(`/api/admin/classes/${classId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name })
    });
    loadData();
  };

  const handleAssign = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetch("/api/admin/assignments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ classId, teacherId: selectedTeacher })
    });
    setSelectedTeacher("");
    loadData();
  };

  const handleRemove = async (teacherId: string) => {
    await fetch("/api/admin/assignments", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ classId, teacherId })
    });
    loadData();
  };

  if (!clazz) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Classe ${clazz.name}`} subtitle="Mettre à jour le nom et les enseignants." />

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Renommer la classe">
          <form onSubmit={handleRename} className="space-y-2">
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
              Mettre à jour
            </button>
          </form>
        </Card>
        <Card title="Assigner un professeur">
          <form onSubmit={handleAssign} className="space-y-2">
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={selectedTeacher}
              onChange={(event) => setSelectedTeacher(event.target.value)}
              required
            >
              <option value="">Sélectionner un professeur</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
              Assigner
            </button>
          </form>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Professeurs assignés">
          <ul className="space-y-2">
            {clazz.teachers.map((link) => (
              <li key={link.teacher.id} className="flex items-center justify-between">
                <span>{link.teacher.teacherProfile?.name ?? link.teacher.email}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(link.teacher.id)}
                  className="text-xs font-semibold text-rose-600"
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Conseils de classe">
          <ul className="space-y-2">
            {clazz.councils.map((council) => (
              <li key={council.id} className="flex items-center justify-between">
                <span>
                  {new Date(council.startsAt).toLocaleString("fr-FR")} · {council.location ?? ""}
                </span>
                <Link href={`/admin/councils/${council.id}`} className="text-xs font-semibold">
                  Voir
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
