/* Seed an admin user for local development. */
/* eslint-disable @typescript-eslint/no-require-imports */
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@example.com";
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Admin",
      hashedPassword,
      role: "ADMIN",
      profilePicture: null,
    },
  });

  const userEmail = "user@example.com";
  const userPassword = "user12345";
  const userHashed = await bcrypt.hash(userPassword, 10);

  await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      name: "User",
      hashedPassword: userHashed,
      role: "USER",
      profilePicture: null,
    },
  });

  console.log("Seeded admin:", email, "password:", password);
  console.log("Seeded user:", userEmail, "password:", userPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
