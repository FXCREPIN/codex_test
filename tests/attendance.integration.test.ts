import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { updateAttendance } from "@/lib/attendance-service";
import { randomUUID } from "crypto";

const databaseUrl = "file:./tests/test.db";

const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl }
  }
});

async function setupSchema() {
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS Attendance;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS Council;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS User;`);
  await prisma.$executeRawUnsafe(`CREATE TABLE User (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    passwordHash TEXT,
    role TEXT,
    createdAt DATETIME
  );`);
  await prisma.$executeRawUnsafe(`CREATE TABLE Council (
    id TEXT PRIMARY KEY,
    classId TEXT,
    startsAt DATETIME,
    location TEXT,
    createdAt DATETIME
  );`);
  await prisma.$executeRawUnsafe(`CREATE TABLE Attendance (
    id TEXT PRIMARY KEY,
    councilId TEXT,
    teacherId TEXT,
    status TEXT,
    updatedAt DATETIME
  );`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX Attendance_councilId_teacherId_key ON Attendance (councilId, teacherId);`);
}

describe("updateAttendance", () => {
  beforeAll(async () => {
    await setupSchema();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates attendance for future council", async () => {
    const teacherId = randomUUID();
    const councilId = randomUUID();
    await prisma.$executeRawUnsafe(
      `INSERT INTO User (id, email, passwordHash, role, createdAt) VALUES (?, ?, ?, ?, ?)`,
      teacherId,
      "teacher@example.com",
      "hash",
      "PROF",
      new Date().toISOString()
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO Council (id, classId, startsAt, location, createdAt) VALUES (?, ?, ?, ?, ?)`,
      councilId,
      "class-1",
      new Date(Date.now() + 86400000).toISOString(),
      "Salle 1",
      new Date().toISOString()
    );

    const attendance = await updateAttendance(prisma, {
      councilId,
      teacherId,
      status: "PRESENT"
    });

    expect(attendance.status).toBe("PRESENT");
  });
});
