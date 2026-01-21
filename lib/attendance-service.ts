import { PrismaClient, AttendanceStatus } from "@prisma/client";

interface UpdateAttendanceInput {
  councilId: string;
  teacherId: string;
  status: AttendanceStatus;
  now?: Date;
}

export async function updateAttendance(
  prisma: PrismaClient,
  { councilId, teacherId, status, now = new Date() }: UpdateAttendanceInput
) {
  const council = await prisma.council.findUnique({
    where: { id: councilId }
  });

  if (!council) {
    throw new Error("Council not found");
  }

  if (council.startsAt < now) {
    throw new Error("Council read-only");
  }

  return prisma.attendance.upsert({
    where: {
      councilId_teacherId: {
        councilId,
        teacherId
      }
    },
    update: {
      status
    },
    create: {
      councilId,
      teacherId,
      status
    }
  });
}
