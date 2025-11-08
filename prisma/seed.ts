/** @format */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create Academic Session
  const session = await prisma.academicSession.upsert({
    where: { name: "2024-25" },
    update: {},
    create: {
      name: "2024-25",
      startYear: 2024,
      endYear: 2025,
      isActive: true,
    },
  });
  console.log("✓ Created academic session:", session.name);

  // Create Exam Groups
  const examGroups = await Promise.all([
    prisma.examGroup.upsert({
      where: { sessionId_name: { sessionId: session.id, name: "Quarterly" } },
      update: {},
      create: {
        name: "Quarterly",
        sessionId: session.id,
      },
    }),
    prisma.examGroup.upsert({
      where: { sessionId_name: { sessionId: session.id, name: "Half-Yearly" } },
      update: {},
      create: {
        name: "Half-Yearly",
        sessionId: session.id,
      },
    }),
    prisma.examGroup.upsert({
      where: { sessionId_name: { sessionId: session.id, name: "Annual" } },
      update: {},
      create: {
        name: "Annual",
        sessionId: session.id,
      },
    }),
  ]);
  console.log("✓ Created exam groups:", examGroups.map(e => e.name).join(", "));

  // Create Classes
  const classes = await Promise.all(
    Array.from({ length: 12 }, (_, i) => i + 1).map((num) =>
      prisma.class.upsert({
        where: { name: num.toString() },
        update: {},
        create: {
          name: num.toString(),
          order: num,
        },
      })
    )
  );
  console.log("✓ Created classes 1-12");

  // Create Subjects for Class 10
  const class10 = classes.find((c) => c.name === "10");
  if (class10) {
    const subjects = await Promise.all([
      prisma.subject.upsert({
        where: { classId_name: { classId: class10.id, name: "Hindi" } },
        update: {},
        create: { name: "Hindi", classId: class10.id },
      }),
      prisma.subject.upsert({
        where: { classId_name: { classId: class10.id, name: "English" } },
        update: {},
        create: { name: "English", classId: class10.id },
      }),
      prisma.subject.upsert({
        where: { classId_name: { classId: class10.id, name: "Mathematics" } },
        update: {},
        create: { name: "Mathematics", classId: class10.id },
      }),
      prisma.subject.upsert({
        where: { classId_name: { classId: class10.id, name: "Science" } },
        update: {},
        create: { name: "Science", classId: class10.id },
      }),
      prisma.subject.upsert({
        where: { classId_name: { classId: class10.id, name: "Social Science" } },
        update: {},
        create: { name: "Social Science", classId: class10.id },
      }),
    ]);
    console.log("✓ Created subjects for Class 10:", subjects.map(s => s.name).join(", "));

    // Create a sample book for Hindi
    const hindiSubject = subjects.find((s) => s.name === "Hindi");
    if (hindiSubject) {
      const book = await prisma.book.upsert({
        where: { subjectId_name: { subjectId: hindiSubject.id, name: "Sparsh" } },
        update: {},
        create: {
          name: "Sparsh",
          subjectId: hindiSubject.id,
        },
      });
      console.log("✓ Created book:", book.name);

      // Create sample chapters
      const chapter1 = await prisma.chapter.upsert({
        where: { bookId_order: { bookId: book.id, order: 1 } },
        update: {},
        create: {
          name: "साखी",
          order: 1,
          bookId: book.id,
        },
      });

      const chapter2 = await prisma.chapter.upsert({
        where: { bookId_order: { bookId: book.id, order: 2 } },
        update: {},
        create: {
          name: "पद",
          order: 2,
          bookId: book.id,
        },
      });
      console.log("✓ Created chapters");

      // Create sample topics
      const topic1 = await prisma.topic.create({
        data: {
          name: "कबीर की साखी",
          chapterId: chapter1.id,
        },
      });

      const topic2 = await prisma.topic.create({
        data: {
          name: "मीरा के पद",
          chapterId: chapter2.id,
        },
      });
      console.log("✓ Created topics");

      // Create sample questions
      await prisma.question.createMany({
        data: [
          {
            text: "कबीर की साखियों का मुख्य उद्देश्य क्या है?",
            type: "SHORT_ANSWER",
            language: "HINDI",
            difficulty: "MEDIUM",
            marks: 3,
            bookId: book.id,
            chapterId: chapter1.id,
            topicId: topic1.id,
            tags: ["कबीर", "साखी", "उद्देश्य"],
          },
          {
            text: "मीरा के पदों में किस भाव की प्रधानता है?",
            type: "SHORT_ANSWER",
            language: "HINDI",
            difficulty: "EASY",
            marks: 2,
            bookId: book.id,
            chapterId: chapter2.id,
            topicId: topic2.id,
            tags: ["मीरा", "पद", "भाव"],
          },
          {
            text: "निम्नलिखित में से कौन सा कबीर का दोहा है?",
            type: "MCQ",
            language: "HINDI",
            difficulty: "EASY",
            marks: 1,
            options: [
              "पोथी पढ़ि पढ़ि जग मुआ, पंडित भया न कोय",
              "मन के हारे हार है, मन के जीते जीत",
              "कर्म प्रधान विश्व करि राखा",
              "सुख में सब साथ देत हैं, दुःख में न कोय",
            ],
            correctAnswer: "पोथी पढ़ि पढ़ि जग मुआ, पंडित भया न कोय",
            bookId: book.id,
            chapterId: chapter1.id,
            topicId: topic1.id,
            tags: ["कबीर", "MCQ", "दोहा"],
          },
          {
            text: "What is the meaning of the word 'Sakhi'?",
            type: "ONE_WORD",
            language: "ENGLISH",
            difficulty: "EASY",
            marks: 1,
            correctAnswer: "Couplet",
            bookId: book.id,
            chapterId: chapter1.id,
            topicId: topic1.id,
            tags: ["vocabulary", "meaning"],
          },
        ],
      });
      console.log("✓ Created sample questions");
    }
  }

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
