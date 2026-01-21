import { z } from "zod";

export const teacherSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  subjects: z.string().optional()
});

export const classSchema = z.object({
  name: z.string().min(2)
});

export const councilSchema = z.object({
  classId: z.string().min(1),
  startsAt: z.string().min(1),
  location: z.string().optional()
});

export const assignmentSchema = z.object({
  classId: z.string().min(1),
  teacherId: z.string().min(1)
});

export const attendanceSchema = z.object({
  councilId: z.string().min(1),
  status: z.enum(["PRESENT", "ABSENT"])
});
