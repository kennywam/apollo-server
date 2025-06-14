# Fusion Labs Assessment - GraphQL API with Job Queue

A simple GraphQL API built with Apollo Server, Prisma, and BullMQ for job queue management.

## Features

- **GraphQL API**: Built with Apollo Server for efficient data querying and manipulation
- **Database ORM**: Uses Prisma for type-safe database access and management
- **Job Queue**: Implements BullMQ for handling asynchronous tasks (email notifications)
- **TypeScript**: Fully typed codebase for better developer experience and code quality

## Project Structure

```
├── prisma/               # Prisma schema and migrations
├── src/
│   ├── lib/              # Shared utilities
│   ├── index.ts          # Main server entry point
│   ├── schema.ts         # GraphQL schema definition
│   ├── resolvers.ts      # GraphQL resolvers
│   └── worker.ts         # BullMQ worker for processing jobs
└── package.json          # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- Redis (for BullMQ)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/fusion_labs"
   REDIS_URL="redis://localhost:6379"
   ```
4. Generate Prisma client:
   ```
   npm run prisma:generate
   ```
5. Run database migrations:
   ```
   npm run prisma:migrate
   ```
6. Seed the database:
   ```
   npm run seed
   ```

### Running the Application

1. Start the GraphQL server:
   ```
   npm start 
   ```
   or 
   ```
   npm run dev 
   ```
2. In a separate terminal, start the worker:
   ```
   npm run worker
   ```
3. Access GraphQL Playground at http://localhost:4000

## GraphQL API

### Queries

- `users`: Get all users
- `user(id: ID!)`: Get a specific user by ID
- `jobs`: Get all jobs
- `job(id: ID!)`: Get a specific job by ID
- `jobsByStatus(status: JobStatus)`: Get jobs filtered by status
- `jobsByUser(userId: ID!)`: Get jobs for a specific user

### Mutations

- `createUser(email: String!, name: String)`: Create a new user
- `createJob(userId: ID!, title: String!)`: Create a new job
- `updateJobStatus(id: ID!, status: JobStatus!)`: Update a job's status
- `deleteJob(id: ID!)`: Delete a job

## Job Queue

The application uses BullMQ to handle asynchronous email notifications when:
- A new task is created
- A task's status is updated

The worker processes these notifications and simulates sending emails.

