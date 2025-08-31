// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // töm tabellen så seeden blir deterministisk
  await prisma.todo.deleteMany()
  // lägg in exempelrader
  await prisma.todo.createMany({
    data: [
      { title: 'Buy milk' },
      { title: 'Ship feature', completed: true },
      { title: 'Write blog post' }
    ]
  })
  console.log('✅ Seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
