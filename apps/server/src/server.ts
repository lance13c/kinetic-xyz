import { AppDataSource, User } from '@kinetic/db';
import { ethers } from 'ethers';
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
        login: async (
          _: any,
          { input }: { input: { email: string; address: string; message: string; signature: string } },
          context: any
        ): Promise<{ success: boolean; token?: string }> => {
          try {
            // Verify the signed message using ethers.js
            const recoveredAddress = ethers.verifyMessage(input.message, input.signature);
            if (recoveredAddress.toLowerCase() !== input.address.toLowerCase()) {
              throw new Error("Signature verification failed");
            }

            const userRepository = datasource.getRepository(User);
            // Find or create the user record based on the web3Address field
            let user = await userRepository.findOne({ where: { web3Address: input.address } });
            if (!user) {
              // Automatically create a new user record if none exists.
              user = userRepository.create({
                web3Address: input.address,
                username: `user_${input.address.substring(0, 6)}`,
                email: '',
              });
              user = await userRepository.save(user);
            }

            // Store user info in the session (using Fastify session)
            context.request.session.user = {
              id: user.id,
              web3Address: user.web3Address,
              username: user.username,
            };
            await context.request.session.save();

            return { success: true };
          } catch (err: any) {
            throw new Error("Login failed: " + err.message);
          }
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
    await app.listen({ port: 3001, host: '0.0.0.0' });
    app.log.info("Fastify server is listening");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
