import { getServerSession } from "next-auth";
import { authOptions, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { councilSchema } from "@/lib/validators";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { quorumStatus } from "@/lib/quorum";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!requireRole("ADMIN", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  const councils = await prisma.council.findMany({
    include: {
      class: {
        include: { teachers: true }
      },
      attendances: true
    },
    orderBy: { startsAt: "asc" }
  });

  return jsonOk(
    councils.map((council) => {
      const expected = council.class.teachers.length;
      const present = council.attendances.filter((attendance) => attendance.status === "PRESENT").length;
      const status = quorumStatus(present, expected);
      return {
        id: council.id,
        classId: council.classId,
        className: council.class.name,
        startsAt: council.startsAt,
        location: council.location,
        expected,
        present,
        quorumRequired: status.required,
        quorumOk: status.ok
      };
    })
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!requireRole("ADMIN", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = councilSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid payload", 422);
  }

  const council = await prisma.$transaction(async (tx) => {
    const created = await tx.council.create({
      data: {
        classId: parsed.data.classId,
        startsAt: new Date(parsed.data.startsAt),
        location: parsed.data.location
      }
    });

    const classTeachers = await tx.classTeacher.findMany({
      where: { classId: parsed.data.classId }
    });

    if (classTeachers.length > 0) {
      await tx.attendance.createMany({
        data: classTeachers.map((link) => ({
          councilId: created.id,
          teacherId: link.teacherId,
          status: "PENDING"
        })),
        skipDuplicates: true
      });
    }

    return created;
  });

  return jsonOk(council, 201);
}
