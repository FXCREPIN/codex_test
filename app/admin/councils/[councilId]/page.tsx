"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";

interface CouncilDetail {
  id: string;
  classId: string;
  startsAt: string;
  location?: string | null;
  class: {
    name: string;
    teachers: { teacher: { id: string; email: string; teacherProfile?: { name: string | null } | null } }[];
  };
  attendances: { teacherId: string; status: string }[];
  quorumRequired: number;
  quorumOk: boolean;
  present: number;
  expected: number;
}

interface ClassRow {
  id: string;
  name: string;
}

export default function CouncilDetailPage() {
  const params = useParams();
  const councilId = params.councilId as string;
  const [council, setCouncil] = useState<CouncilDetail | null>(null);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [classId, setClassId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [location, setLocation] = useState("");

  const loadData = async () => {
    const [councilResponse, classesResponse] = await Promise.all([
      fetch(`/api/admin/councils/${councilId}`),
      fetch("/api/admin/classes")
    ]);
    const councilData = await councilResponse.json();
    setCouncil(councilData);
    setClasses(await classesResponse.json());
    setClassId(councilData.classId);
    setStartsAt(new Date(councilData.startsAt).toISOString().slice(0, 16));
    setLocation(councilData.location ?? "");
  };

  useEffect(() => {
    loadData();
  }, [councilId]);

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetch(`/api/admin/councils/${councilId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ classId, startsAt, location })
    });
    loadData();
  };

  if (!council) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Conseil ${council.class.name}`} subtitle="Mettre à jour les informations." />

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Résumé du quorum">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Présents confirmés</p>
              <p className="text-2xl font-semibold">
                {council.present}/{council.expected}
              </p>
              <p className="text-xs text-slate-500">Quorum requis : {council.quorumRequired}</p>
            </div>
            <StatusBadge label={council.quorumOk ? "OK" : "RISQUE"} tone={council.quorumOk ? "green" : "red"} />
          </div>
        </Card>
        <Card title="Mettre à jour le conseil">
          <form onSubmit={handleUpdate} className="space-y-2">
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
            >
              {classes.map((clazz) => (
                <option key={clazz.id} value={clazz.id}>
                  {clazz.name}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              required
            />
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Salle"
            />
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
              Enregistrer
            </button>
          </form>
        </Card>
      </div>

      <Card title="Réponses des professeurs">
        <ul className="space-y-2">
          {council.class.teachers.map((link) => {
            const attendance = council.attendances.find((item) => item.teacherId === link.teacher.id);
            const status = attendance?.status ?? "PENDING";
            const badgeTone = status === "PRESENT" ? "green" : status === "ABSENT" ? "red" : "amber";
            const label = status === "PRESENT" ? "Présent" : status === "ABSENT" ? "Indisponible" : "En attente";
            return (
              <li key={link.teacher.id} className="flex items-center justify-between">
                <span>{link.teacher.teacherProfile?.name ?? link.teacher.email}</span>
                <StatusBadge label={label} tone={badgeTone} />
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
