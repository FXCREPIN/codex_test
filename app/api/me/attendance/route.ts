import { getServerSession } from "next-auth";
import { authOptions, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { attendanceSchema } from "@/lib/validators";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { updateAttendance } from "@/lib/attendance-service";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!requireRole("PROF", session?.user?.role)) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = attendanceSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid payload", 422);
  }

  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" }
  });

  if (!user) {
    return jsonError("User not found", 404);
  }

  let attendance;
  try {
    attendance = await updateAttendance(prisma, {
      councilId: parsed.data.councilId,
      teacherId: user.id,
      status: parsed.data.status
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Council not found") {
      return jsonError(message, 404);
    }
    if (message === "Council read-only") {
      return jsonError(message, 409);
    }
    return jsonError(message, 400);
  }

  return jsonOk(attendance);
}
