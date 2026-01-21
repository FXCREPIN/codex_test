import { getServerSession } from "next-auth";
import { authOptions, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { classSchema } from "@/lib/validators";
import { jsonError, jsonOk } from "@/lib/api-utils";

interface Params {
  params: { classId: string };
}

export async function GET(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!requireRole("ADMIN", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  const clazz = await prisma.class.findUnique({
    where: { id: params.classId },
    include: {
      teachers: { include: { teacher: { include: { teacherProfile: true } } } },
      councils: { orderBy: { startsAt: "asc" } }
    }
  });

  if (!clazz) {
    return jsonError("Not found", 404);
  }

  return jsonOk(clazz);
}

export async function PUT(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!requireRole("ADMIN", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = classSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid payload", 422);
  }

  const clazz = await prisma.class.update({
    where: { id: params.classId },
    data: { name: parsed.data.name }
  });

  return jsonOk(clazz);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!requireRole("ADMIN", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  await prisma.class.delete({
    where: { id: params.classId }
  });

  return jsonOk({ success: true });
}
