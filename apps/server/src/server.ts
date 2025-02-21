import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import { AppDataSource, User } from '@kinetic/db';
import Fastify, { FastifyInstance } from 'fastify';
import { readFileSync } from 'fs';
import mercurius from 'mercurius';
import { join } from 'path';
import 'reflect-metadata';
import { verifyMessage } from 'viem';
import { z } from 'zod';

// Zod schema to validate and transform login input
const loginInputSchema = z.object({
  email: z.string().optional(),
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
    .transform(val => val as `0x${string}`),
  message: z.string(),
  signature: z
    .string()
    .regex(/^0x[a-fA-F0-9]+$/, "Invalid signature format")
    .transform(val => val as `0x${string}`),
});

export async function createServer(): Promise<FastifyInstance> {
  const FASTIFY_SECRET = process.env.FASTIFY_SECRET;
  if (!FASTIFY_SECRET) throw new Error("Missing FASTIFY_SECRET environment variable");

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

  // Register cookie and session plugins BEFORE Mercurius
  app.register(fastifyCookie);
  app.register(fastifySession, {
    secret: FASTIFY_SECRET,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  });

  // Register an onClose hook to properly destroy the datasource when the server shuts down
  app.addHook('onClose', async () => {
    if (datasource?.isInitialized) {
      await datasource.destroy();
      app.log.info("Datasource connection closed");
    }
  });

  // Register Mercurius (GraphQL) with an explicit context function so that session is available.
  app.register(mercurius, {
    schema: readFileSync(join(__dirname, 'schema.graphql'), 'utf8'),
    context: (request, reply) => ({ request, reply }),
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
            // Validate and transform input using Zod
            const parsedInput = loginInputSchema.parse(input);

            const isVerified = await verifyMessage({
              address: parsedInput.address,
              message: parsedInput.message,
              signature: parsedInput.signature,
            });

            if (!isVerified) {
              console.error("Signature verification failed");
              // return 400 Bad Request if signature verification fails
              return { success: false };
            }

            const userRepository = datasource.getRepository(User);
            // Find or create the user record based on the web3Address field
            let user = await userRepository.findOne({ where: { web3Address: parsedInput.address } });
            if (!user) {
              // Automatically create a new user record if none exists.
              user = userRepository.create({
                web3Address: parsedInput.address,
                email: '',
              });
              user = await userRepository.save(user);
            }

            // Store user info in the session (context.request.session is now available)
            context.request.session.user = {
              id: user.id,
              web3Address: user.web3Address,
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
