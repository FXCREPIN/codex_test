import { getServerSession } from "next-auth";
import { authOptions, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!requireRole("ADMIN", session?.user?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "councils";

  if (type === "teachers") {
    const teachers = await prisma.user.findMany({
      where: { role: "PROF" },
      include: {
        teacherProfile: true,
        attendances: true
      }
    });

    const rows = ["teacher,email,present_count,absent_count,pending_count"];
    for (const teacher of teachers) {
      const present = teacher.attendances.filter((attendance) => attendance.status === "PRESENT").length;
      const absent = teacher.attendances.filter((attendance) => attendance.status === "ABSENT").length;
      const pending = teacher.attendances.filter((attendance) => attendance.status === "PENDING").length;
      rows.push(
        `${teacher.teacherProfile?.name ?? teacher.email},${teacher.email},${present},${absent},${pending}`
      );
    }

    return new NextResponse(rows.join("\n"), {
      status: 200,
      headers: {
        "content-type": "text/csv"
      }
    });
  }

  const councils = await prisma.council.findMany({
    include: {
      class: true,
      attendances: true
    },
    orderBy: { startsAt: "asc" }
  });

  const rows = ["class,starts_at,location,present_count,absent_count,pending_count"];
  for (const council of councils) {
    const present = council.attendances.filter((attendance) => attendance.status === "PRESENT").length;
    const absent = council.attendances.filter((attendance) => attendance.status === "ABSENT").length;
    const pending = council.attendances.filter((attendance) => attendance.status === "PENDING").length;
    rows.push(
      `${council.class.name},${council.startsAt.toISOString()},${council.location ?? ""},${present},${absent},${pending}`
    );
  }

  return new NextResponse(rows.join("\n"), {
    status: 200,
    headers: {
      "content-type": "text/csv"
    }
  });
}
