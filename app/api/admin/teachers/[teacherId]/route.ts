import { getServerSession } from "next-auth";
import { authOptions, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { teacherSchema } from "@/lib/validators";
import { jsonError, jsonOk } from "@/lib/api-utils";

interface Params {
  params: { teacherId: string };
}

export async function PUT(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!requireRole("ADMIN", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = teacherSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid payload", 422);
  }

  const teacher = await prisma.user.update({
    where: { id: params.teacherId },
    data: {
      email: parsed.data.email,
      teacherProfile: {
        upsert: {
          create: {
            name: parsed.data.name,
            subjects: parsed.data.subjects
          },
          update: {
            name: parsed.data.name,
            subjects: parsed.data.subjects
          }
        }
      }
    },
    include: { teacherProfile: true }
  });

  return jsonOk({
    id: teacher.id,
    email: teacher.email,
    name: teacher.teacherProfile?.name ?? "",
    subjects: teacher.teacherProfile?.subjects ?? ""
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!requireRole("ADMIN", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  await prisma.user.delete({
    where: { id: params.teacherId }
  });

  return jsonOk({ success: true });
}
