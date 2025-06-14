import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')

  // Clean up existing data
  console.log('Cleaning up existing data...')
  await prisma.task.deleteMany({})
  await prisma.user.deleteMany({})

  // Create users
  console.log('Creating users...')
  const ken = await prisma.user.create({
    data: {
      email: 'ken@gmail.com',
      name: 'Ken',
    },
  })

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
    },
  })

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith',
    },
  })

  console.log('Creating tasks...')

  // tasks for Ken
  await prisma.task.create({
    data: {
      title: 'Build GraphQL API',
      status: 'COMPLETED',
      userId: ken.id,
    },
  })

  await prisma.task.create({
    data: {
      title: 'Implement task Queue',
      status: 'IN_PROGRESS',
      userId: ken.id,
    },
  })

  await prisma.task.create({
    data: {
      title: 'Write Documentation',
      status: 'PENDING',
      userId: ken.id,
    },
  })

  // tasks for Alice
  await prisma.task.create({
    data: {
      title: 'Design User Interface',
      status: 'COMPLETED',
      userId: alice.id,
    },
  })

  await prisma.task.create({
    data: {
      title: 'Implement Authentication',
      status: 'CANCELLED',
      userId: alice.id,
    },
  })

  // tasks for Bob
  await prisma.task.create({
    data: {
      title: 'Set up CI/CD Pipeline',
      status: 'PENDING',
      userId: bob.id,
    },
  })

  await prisma.task.create({
    data: {
      title: 'Write Unit Tests',
      status: 'IN_PROGRESS',
      userId: bob.id,
    },
  })

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seeding:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
