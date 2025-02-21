import { AppDataSource, User } from '@kinetic/db';
import Fastify, { FastifyInstance } from 'fastify';
import { readFileSync } from 'fs';
import mercurius from 'mercurius';
import { join } from 'path';
import 'reflect-metadata';

// Create and configure the Fastify server instance
export async function createServer(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  
  let datasource;
  try {
    // Initialize the database connection
    datasource = await AppDataSource.initialize();
    app.log.info("Connected to PostgreSQL database");
  } catch (error) {
    app.log.error("Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }

  // Register an onClose hook to properly destroy the datasource when the server shuts down
  app.addHook('onClose', async () => {
    if (datasource?.isInitialized) {
      await datasource.destroy();
      app.log.info("Datasource connection closed");
    }
  });

  // Register the GraphQL plugin with resolvers and enable GraphiQL
  app.register(mercurius, {
    schema: readFileSync(join(__dirname, 'schema.graphql'), 'utf8'),
    resolvers: {
      Query: {
        // Return a list of users from the database
        users: async () => {
          const userRepository = datasource.getRepository(User);
          return userRepository.find();
        },
      },
      Mutation: {
        // Create a new user with the provided email
        createUser: async (_: any, { input }: { input: { email: string, username: string } }): Promise<User> => {
          const userRepository = datasource.getRepository(User);
          const newUser = userRepository.create({  
            username: input.username,
          email: input.email, });
          return userRepository.save(newUser);
        },
      },
    },
    graphiql: true,
  });

  return app;
}

// Start the server by creating it and listening on a port
export async function startServer(): Promise<void> {
  const app = await createServer();
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    app.log.info("Fastify server is listening");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
