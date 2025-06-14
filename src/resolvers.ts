import { prisma } from './lib/prisma';
import { queueEmail } from './worker';

export const resolvers = {
  Query: {
    users: async () => prisma.user.findMany({ include: { tasks: true } }),
    user: async (_: any, args: { id: string }) => {
      return prisma.user.findUnique({
        where: { id: Number(args.id) },
        include: { tasks: true },
      });
    },
    tasks: async () => prisma.task.findMany({ include: { user: true } }),
    task: async (_: any, args: { id: string }) => {
      return prisma.task.findUnique({
        where: { id: Number(args.id) },
        include: { user: true },
      });
    },
    tasksByStatus: async (_: any, args: { status: string }) => {
      return prisma.task.findMany({
        where: { status: args.status },
        include: { user: true },
      });
    },
    tasksByUser: async (_: any, args: { userId: string }) => {
      return prisma.task.findMany({
        where: { userId: Number(args.userId) },
        include: { user: true },
      });
    },
  },
  Mutation: {
    createTask: async (_: any, args: { userId: string; title: string }) => {
      const task = await prisma.task.create({
        data: {
          title: args.title,
          userId: Number(args.userId),
        },
        include: { user: true },
      });

      await queueEmail(task);
      return task;
    },
    updateTaskStatus: async (_: any, args: { id: string; status: string }) => {
      const task = await prisma.task.update({
        where: { id: Number(args.id) },
        data: { status: args.status },
        include: { user: true },
      });
      
      await queueEmail({
        ...task,
        user: task.user,
      });
      
      return task;
    },
    createUser: async (_: any, args: { email: string; name?: string }) => {
      return prisma.user.create({
        data: {
          email: args.email,
          name: args.name || null,
        },
      });
    },
    deleteTask: async (_: any, args: { id: string }) => {
      await prisma.task.delete({
        where: { id: Number(args.id) },
      });
      return true;
    },
  },
  task: {
    createdAt: (task: any) => new Date(task.createdAt).toISOString(),
  },
};
