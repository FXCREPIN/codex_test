import { getServerSession } from "next-auth";
import { authOptions, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { councilSchema } from "@/lib/validators";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { quorumStatus } from "@/lib/quorum";

interface Params {
  params: { councilId: string };
}

export async function GET(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!requireRole("ADMIN", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  const council = await prisma.council.findUnique({
    where: { id: params.councilId },
    include: {
      class: { include: { teachers: { include: { teacher: { include: { teacherProfile: true } } } } } },
      attendances: true
    }
  });

  if (!council) {
    return jsonError("Not found", 404);
  }

  const expected = council.class.teachers.length;
  const present = council.attendances.filter((attendance) => attendance.status === "PRESENT").length;
  const status = quorumStatus(present, expected);

  return jsonOk({
    ...council,
    expected,
    present,
    quorumRequired: status.required,
    quorumOk: status.ok
  });
}

export async function PUT(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!requireRole("ADMIN", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = councilSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid payload", 422);
  }

  const council = await prisma.council.update({
    where: { id: params.councilId },
    data: {
      classId: parsed.data.classId,
      startsAt: new Date(parsed.data.startsAt),
      location: parsed.data.location
    }
  });

  return jsonOk(council);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!requireRole("ADMIN", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  await prisma.council.delete({
    where: { id: params.councilId }
  });

  return jsonOk({ success: true });
}
