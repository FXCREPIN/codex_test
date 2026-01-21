import { PrismaClient, AttendanceStatus, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordAdmin = await hash("direction", 10);
  const passwordTeacher = await hash("professeur", 10);

  await prisma.attendance.deleteMany();
  await prisma.council.deleteMany();
  await prisma.classTeacher.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.class.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: "direction@gmail.com",
      passwordHash: passwordAdmin,
      role: Role.ADMIN,
      teacherProfile: {
        create: {
          name: "Direction"
        }
      }
    }
  });

  const teachers = await Promise.all(
    Array.from({ length: 10 }).map((_, index) =>
      prisma.user.create({
        data: {
          email: index === 0 ? "professeur@gmail.com" : `prof${index + 1}@gmail.com`,
          passwordHash: passwordTeacher,
          role: Role.PROF,
          teacherProfile: {
            create: {
              name: index === 0 ? "Professeur 1" : `Professeur ${index + 1}`,
              subjects: index % 2 === 0 ? "Mathématiques" : "Français"
            }
          }
        }
      })
    )
  );

  const classes = await prisma.class.createMany({
    data: [{ name: "3A" }, { name: "4B" }]
  });

  const classList = await prisma.class.findMany();

  await prisma.classTeacher.createMany({
    data: teachers.flatMap((teacher, index) => ({
      classId: classList[index % classList.length].id,
      teacherId: teacher.id
    }))
  });

  const now = new Date();
  const councils = await prisma.council.createMany({
    data: [
      {
        classId: classList[0].id,
        startsAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        location: "Salle 101"
      },
      {
        classId: classList[0].id,
        startsAt: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        location: "Salle 102"
      },
      {
        classId: classList[1].id,
        startsAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        location: "Salle 201"
      },
      {
        classId: classList[1].id,
        startsAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        location: "Salle 202"
      }
    ]
  });

  const councilList = await prisma.council.findMany();
  const classTeachers = await prisma.classTeacher.findMany();

  await prisma.attendance.createMany({
    data: councilList.flatMap((council) =>
      classTeachers
        .filter((link) => link.classId === council.classId)
        .map((link, idx) => ({
          councilId: council.id,
          teacherId: link.teacherId,
          status: idx % 3 === 0 ? AttendanceStatus.PRESENT : AttendanceStatus.PENDING
        }))
    )
  });

  console.log(`Seeded with admin ${admin.email} and ${teachers.length} teachers.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
