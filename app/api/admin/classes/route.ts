import { getServerSession } from "next-auth";
import { parse } from "csv-parse/sync";
import { authOptions, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { classSchema } from "@/lib/validators";
import { jsonError, jsonOk } from "@/lib/api-utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!requireRole("ADMIN", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  const classes = await prisma.class.findMany({
    include: {
      teachers: { include: { teacher: { include: { teacherProfile: true } } } }
    },
    orderBy: { name: "asc" }
  });

  return jsonOk(
    classes.map((clazz) => ({
      id: clazz.id,
      name: clazz.name,
      teachers: clazz.teachers.map((link) => ({
        id: link.teacher.id,
        name: link.teacher.teacherProfile?.name ?? link.teacher.email
      }))
    }))
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!requireRole("ADMIN", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("text/csv")) {
    const text = await request.text();
    const records = parse(text, {
      trim: true,
      skip_empty_lines: true
    }) as string[][];

    const classNames = records
      .map((row) => row[0])
      .filter((name) => typeof name === "string" && name.length > 1);

    if (classNames.length === 0) {
      return jsonError("CSV vide", 422);
    }

    const created = await prisma.class.createMany({
      data: classNames.map((name) => ({ name })),
      skipDuplicates: true
    });

    return jsonOk({ created: created.count }, 201);
  }

  const body = await request.json();
  const parsed = classSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid payload", 422);
  }

  const clazz = await prisma.class.create({
    data: {
      name: parsed.data.name
    }
  });

  return jsonOk(clazz, 201);
}
