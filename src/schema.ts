import { gql } from 'apollo-server';

export const typeDefs = gql`
  enum taskStatus {
    PENDING
    IN_PROGRESS
    COMPLETED
    CANCELLED
  }

  type User {
    id: ID!
    name: String
    email: String!
    tasks: [task!]!
  }

  type task {
    id: ID!
    title: String!
    status: taskStatus!
    createdAt: String!
    user: User!
  }

  type EmailNotification {
    id: ID!
    to: String!
    subject: String!
    body: String!
    sentAt: String
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    tasks: [task!]!
    task(id: ID!): task
    tasksByStatus(status: taskStatus): [task!]!
    tasksByUser(userId: ID!): [task!]!
  }

  type Mutation {
    createTask(userId: ID!, title: String!): task!
    updateTaskStatus(id: ID!, status: taskStatus!): task!
    createUser(email: String!, name: String): User!
    deleteTask(id: ID!): Boolean!
  }
`;
