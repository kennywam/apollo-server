import { Queue, Worker, Job } from 'bullmq'
import IORedis from 'ioredis'
import { task as PrismaTask } from '@prisma/client'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
console.log(`Connecting to Redis at: ${redisUrl}`)

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
})

connection.on('connect', () => {
  console.log('Successfully connected to Redis')
})

connection.on('error', (err) => {
  console.error('Redis connection error:', err)
})

const QUEUE_PREFIX = 'fusion-labs-assessment'
const emailQueue = new Queue('email', {
  connection,
  prefix: QUEUE_PREFIX,
})

interface EmailData {
  to: string
  subject: string
  body: string
}

export const queueEmail = async (
  task: PrismaTask & { user: { email: string } }
) => {
  let subject = 'task Update'
  let body = `task "${task.title}" was updated.`

  if (task.status === 'PENDING') {
    subject = 'New task Created'
    body = `task "${task.title}" was created and is pending.`
  } else if (task.status === 'IN_PROGRESS') {
    subject = 'task Started'
    body = `task "${task.title}" is now in progress.`
  } else if (task.status === 'COMPLETED') {
    subject = 'task Completed'
    body = `task "${task.title}" has been completed successfully.`
  } else if (task.status === 'CANCELLED') {
    subject = 'task Cancelled'
    body = `task "${task.title}" has been cancelled.`
  }

  await emailQueue.add(
    'email-notification',
    {
      to: task.user.email,
      subject,
      body,
      taskId: task.id,
      timestamp: new Date().toISOString(),
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
    }
  )

  console.log(
    `Email queued for ${task.user.email} regarding task "${task.title}"`
  )
}

const sendEmail = async (data: EmailData): Promise<boolean> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log('\n====================================')
  console.log('SENDING EMAIL')
  console.log('====================================')
  console.log(`To: ${data.to}`)
  console.log(`Subject: ${data.subject}`)
  console.log(`Body: ${data.body}`)
  console.log('====================================\n')

  return true
}

if (require.main === module) {
  console.log('Starting email worker...')

  // Debug queue status
  const checkQueueStatus = async () => {
    try {
      const jobCounts = await emailQueue.getJobCounts(
        'waiting',
        'active',
        'completed',
        'failed'
      )
      console.log('Queue status:', jobCounts)

      // List all waiting jobs for debugging
      const waitingJobs = await emailQueue.getJobs(['waiting'], 0, 10)
      if (waitingJobs.length > 0) {
        console.log(`Found ${waitingJobs.length} waiting tasks:`)
        waitingJobs.forEach((job) => {
          console.log(`- Job ${job.id}, name: ${job.name}, data:`, job.data)
        })
      }
    } catch (err) {
      console.error('Error checking queue status:', err)
    }
  }

  checkQueueStatus()
  setInterval(checkQueueStatus, 5000)

  const cleanupOldJobs = async () => {
    try {
      await emailQueue.obliterate({ force: true })
      console.log('Queue cleaned up successfully')
    } catch (err) {
      console.error('Error cleaning up queue:', err)
    }
  }

  cleanupOldJobs()

  const worker = new Worker(
    'email',
    async (job: Job<EmailData>) => {
      console.log(`Processing email job ${job.id}... Name: ${job.name}`)
      return await sendEmail(job.data)
    },
    {
      connection,
      prefix: QUEUE_PREFIX,
      // Configure concurrency and other worker settings
      concurrency: 5,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
    }
  )

  worker.on('ready', () => {
    console.log('Worker is ready to process jobs')
  })

  worker.on('completed', (job) => {
    console.log(`✅ Email Job ${job.id} completed successfully`)
  })

  worker.on('failed', (job, err) => {
    console.error(`❌ Email Job ${job?.id} failed:`, err)
  })

  console.log('Email worker is running and waiting for jobs...')
}
