import { getServerSession } from "next-auth";
import { authOptions, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { quorumStatus } from "@/lib/quorum";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!requireRole("PROF", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" }
  });

  if (!user) {
    return jsonError("User not found", 404);
  }

  const councils = await prisma.council.findMany({
    where: {
      class: {
        teachers: {
          some: { teacherId: user.id }
        }
      }
    },
    include: {
      class: { include: { teachers: true } },
      attendances: true
    },
    orderBy: { startsAt: "asc" }
  });

  return jsonOk(
    councils.map((council) => {
      const expected = council.class.teachers.length;
      const present = council.attendances.filter((attendance) => attendance.status === "PRESENT").length;
      const status = quorumStatus(present, expected);
      const myAttendance = council.attendances.find((attendance) => attendance.teacherId === user.id);

      return {
        id: council.id,
        className: council.class.name,
        startsAt: council.startsAt,
        location: council.location,
        myStatus: myAttendance?.status ?? "PENDING",
        expected,
        present,
        quorumRequired: status.required,
        quorumOk: status.ok
      };
    })
  );
}
