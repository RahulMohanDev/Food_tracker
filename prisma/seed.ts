import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create or get the default house
  const house = await prisma.house.upsert({
    where: { name: 'Default House' },
    update: {},
    create: { name: 'Default House' },
  })

  // Create users
  await prisma.user.upsert({
    where: { name: 'Rahul Mohan' },
    update: {},
    create: {
      name: 'Rahul Mohan',
      houseId: house.id
    },
  })

  await prisma.user.upsert({
    where: { name: 'Rahul Krishnan' },
    update: {},
    create: {
      name: 'Rahul Krishnan',
      houseId: house.id
    },
  })

  console.log('House and users created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
