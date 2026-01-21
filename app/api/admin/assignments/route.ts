import { getServerSession } from "next-auth";
import { authOptions, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assignmentSchema } from "@/lib/validators";
import { jsonError, jsonOk } from "@/lib/api-utils";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!requireRole("ADMIN", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = assignmentSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid payload", 422);
  }

  const link = await prisma.$transaction(async (tx) => {
    const created = await tx.classTeacher.create({
      data: {
        classId: parsed.data.classId,
        teacherId: parsed.data.teacherId
      }
    });

    const councils = await tx.council.findMany({ where: { classId: parsed.data.classId } });
    if (councils.length > 0) {
      await tx.attendance.createMany({
        data: councils.map((council) => ({
          councilId: council.id,
          teacherId: parsed.data.teacherId,
          status: "PENDING"
        })),
        skipDuplicates: true
      });
    }

    return created;
  });

  return jsonOk(link, 201);
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!requireRole("ADMIN", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = assignmentSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid payload", 422);
  }

  await prisma.classTeacher.delete({
    where: {
      classId_teacherId: {
        classId: parsed.data.classId,
        teacherId: parsed.data.teacherId
      }
    }
  });

  return jsonOk({ success: true });
}
