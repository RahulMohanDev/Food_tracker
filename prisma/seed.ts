import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create users
  await prisma.user.upsert({
    where: { name: 'Rahul Mohan' },
    update: {},
    create: { name: 'Rahul Mohan' },
  })

  await prisma.user.upsert({
    where: { name: 'Rahul Krishnan' },
    update: {},
    create: { name: 'Rahul Krishnan' },
  })

  console.log('Users created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
