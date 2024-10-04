const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding the database.');
  try {
    // Clear the database.
    await prisma.student.deleteMany();
    await prisma.instructor.deleteMany();

    // Add 5 instructors with hashed passwords.
    const instructors = await Promise.all(
      [...Array(5)].map(async () => {
        const hashedPassword = await bcrypt.hash(faker.internet.password(), 10);
        return prisma.instructor.create({
          data: {
            username: faker.internet.userName(),
            password: hashedPassword,
          },
        });
      })
    );

    // Add 4 students for each instructor.
    await Promise.all(
      [...Array(20)].map((_, i) =>
        prisma.student.create({
          data: {
            name: faker.person.fullName(),
            cohort: faker.number.int({ min: 2000, max: 3000 }).toString(),
            instructorId: instructors[i % 5].id,
          },
        })
      )
    );

    console.log('Database is seeded.');
  } catch (err) {
    console.error(err);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
