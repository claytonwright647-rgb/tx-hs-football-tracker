import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

try {
  const team = await prisma.team.upsert({
    where: {
      maxprepsUrl: 'https://www.maxpreps.com/tx/arlington/martin-warriors/football/',
    },
    update: {},
    create: {
      name: 'Martin',
      school: 'Arlington Martin HS',
      city: 'Arlington',
      classification: '6A',
      district: '8-6A',
      maxprepsUrl: 'https://www.maxpreps.com/tx/arlington/martin-warriors/football/',
    },
  })

  console.log(`Seeded ${team.name}`)
} finally {
  await prisma.$disconnect()
}
