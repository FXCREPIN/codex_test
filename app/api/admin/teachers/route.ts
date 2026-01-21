import { getServerSession } from "next-auth";
import { authOptions, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { teacherSchema } from "@/lib/validators";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { hash } from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!requireRole("ADMIN", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  const teachers = await prisma.user.findMany({
    where: { role: "PROF" },
    include: { teacherProfile: true },
    orderBy: { createdAt: "desc" }
  });

  return jsonOk(
    teachers.map((teacher) => ({
      id: teacher.id,
      email: teacher.email,
      name: teacher.teacherProfile?.name ?? "",
      subjects: teacher.teacherProfile?.subjects ?? ""
    }))
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!requireRole("ADMIN", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = teacherSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid payload", 422);
  }

  const passwordHash = await hash("professeur", 10);

  const teacher = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      role: "PROF",
      teacherProfile: {
        create: {
          name: parsed.data.name,
          subjects: parsed.data.subjects
        }
      }
    },
    include: { teacherProfile: true }
  });

  return jsonOk(
    {
      id: teacher.id,
      email: teacher.email,
      name: teacher.teacherProfile?.name ?? "",
      subjects: teacher.teacherProfile?.subjects ?? ""
    },
    201
  );
}
