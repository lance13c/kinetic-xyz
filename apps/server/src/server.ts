import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifySession from '@fastify/session';
import { AppDataSource, User } from '@kinetic/db';
import Fastify, { FastifyInstance } from 'fastify';
import { print } from 'graphql';
import 'graphql-import-node';
import mercurius from 'mercurius';
import 'reflect-metadata';
import { coinDetailsSchema, formatCoinData, formatMarketCoin, formattedCoinSchema, historicalDataSchema, marketCoinSchema } from 'src/helper';
import { verifyMessage } from 'viem';
import { z } from 'zod';

// Keep schema import graphql-import-node 
import schema from '@kinetic/graphql/schema.graphql';
const schemaAsText = print(schema);

// Extend Fastify's request and session types to include user info.
declare module 'fastify' {
  interface FastifyRequest {
    user?: { id: string };
  }
}
declare module '@fastify/session' {
  interface FastifySessionObject {
    user?: { id: string };
  }
}

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
  if (!FASTIFY_SECRET)
    throw new Error("Missing FASTIFY_SECRET environment variable");

  const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
  if (!COINGECKO_API_KEY)
    throw new Error("Missing COINGECKO_API_KEY environment variable");

  const app = Fastify({ logger: true });
  let datasource;
  try {
    datasource = await AppDataSource.initialize();
    app.log.info("Connected to PostgreSQL database");
  } catch (error) {
    app.log.error("Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }

  app.register(fastifyCors, { origin: true });
  app.register(fastifyCookie);
  app.register(fastifySession, {
    secret: FASTIFY_SECRET,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  });

  // Authentication middleware: extract user from session and attach to request
  app.addHook('preHandler', async (request) => {
    if (request.session && request.session.user) {
      request.user = request.session.user;
    }
  });

  // Close datasource on shutdown
  app.addHook('onClose', async () => {
    if (datasource?.isInitialized) {
      await datasource.destroy();
      app.log.info("Datasource connection closed");
    }
  });

  app.register(mercurius, {
    schema: schemaAsText,
    defineMutation: process.env.NODE_ENV !== 'production',
    context: (request, reply) => ({ request, reply }),
    resolvers: {
      // Update your resolvers to use the schemas
      Query: {
        me: async (_: any, __: any, context: any): Promise<User | null> => {
          const userId = context.request.user?.id;
          if (!userId) {
            return null;
          }

          const userRepository = datasource.getRepository(User);
          return userRepository.findOne({ where: { id: userId } });
        },
        watchlist: async (_: any, __: any, context: any): Promise<any[]> => {
          const userId = context.request.user?.id;
          if (!userId) {
            return [];
          }

          const fetchAndFormatCoin = async (coinId: string) => {
            try {
              const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=true&market_data=true&community_data=true&developer_data=true&sparkline=false`,
                {
                  headers: {
                    'accept': 'application/json', // Use 'accept' header for GET requests per API docs
                    'x-cg-demo-api-key': COINGECKO_API_KEY,
                  },
                }
              );

              if (!response.ok) {
                throw new Error(`Failed to fetch data for coin ${coinId}: ${response.statusText}`);
              }

              const rawData = await response.json();
              // Validate the raw data
              const validatedCoin = coinDetailsSchema.parse(rawData);
              // Format the validated data
              return formatCoinData(validatedCoin);
            } catch (error) {
              console.error(`Error fetching/validating data for coin ${coinId}:`, error);
              return null;
            }
          };

          const userRepository = datasource.getRepository(User);
          const user = await userRepository.findOne({ where: { id: userId } });
          if (!user?.watchlist?.length) {
            console.info("No watchlist found for user", userId);
            return [];
          }

          const coinData = await Promise.all(user.watchlist.map(fetchAndFormatCoin));
          return coinData.filter((data): data is z.infer<typeof formattedCoinSchema> => data !== null);
        },

        marketCoins: async (_: any, args: { limit?: number; page?: number; currency?: string }) => {
          const limit = args.limit && args.limit > 50 ? 50 : args.limit || 50;
          const page = args.page || 1;
          const currency = args.currency || 'usd';

          // Fetch market data
          const marketsUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${limit}&page=${page}&sparkline=false&price_change_percentage=24h`;
          const response = await fetch(marketsUrl, {
            headers: {
              'Content-Type': 'application/json',
              'x-cg-demo-api-key': COINGECKO_API_KEY
            },
          });

          if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
          }

          const rawCoins = await response.json();
          // Validate the market data
          const validatedCoins = z.array(marketCoinSchema).parse(rawCoins);

          // Fetch and validate additional details for each coin
          const coinsWithTokenData = await Promise.all(
            validatedCoins.map(async (coin) => {
              try {
                const detailUrl = `https://api.coingecko.com/api/v3/coins/${coin.id}`;
                const detailResponse = await fetch(detailUrl, {
                  headers: {
                    'Content-Type': 'application/json',
                    'x-cg-demo-api-key': COINGECKO_API_KEY
                  },
                });

                if (!detailResponse.ok) {
                  return formatMarketCoin(coin, { tokenAddress: null });
                }

                const rawDetails = await detailResponse.json();
                const validatedDetails = coinDetailsSchema.parse(rawDetails);

                return formatMarketCoin(coin, {
                  tokenAddress: validatedDetails.platforms.solana || null
                });
              } catch (error) {
                console.error(`Error fetching details for ${coin.id}:`, error);
                return formatMarketCoin(coin, { tokenAddress: null });
              }
            })
          );

          return coinsWithTokenData;
        },

        coinHistoricalDataRange: async (
          _: any,
          args: { coinId: string; currency: string; from: number; to: number; precision?: string }
        ) => {
          const precisionQuery = args.precision ? `&precision=${args.precision}` : '';
          const url = `https://api.coingecko.com/api/v3/coins/${args.coinId}/market_chart/range?vs_currency=${args.currency}&from=${args.from}&to=${args.to}${precisionQuery}`;

          const response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
              'x-cg-demo-api-key': COINGECKO_API_KEY
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch historical range data');
          }

          const rawData = await response.json();
          return historicalDataSchema.parse(rawData);
        },
      },
      Mutation: {
        logout: async (_: any, __: any, context: any) => {
          if (context.request.session) {
            await context.request.session.destroy();
          }
          return true;
        },
        login: async (
          _: any,
          { input }: { input: { email?: string; address: string; message: string; signature: string } },
          context: any
        ): Promise<{ success: boolean; token?: string }> => {
          console.log("Login input received:", input);
          try {
            const parsedInput = loginInputSchema.parse(input);
            const isVerified = await verifyMessage({
              address: parsedInput.address,
              message: parsedInput.message,
              signature: parsedInput.signature,
            });

            if (!isVerified) {
              console.error("Signature verification failed");
              return { success: false };
            }

            const userRepository = datasource.getRepository(User);
            let user = await userRepository.findOne({ where: { web3Address: parsedInput.address } });
            if (!user) {
              user = userRepository.create({
                web3Address: parsedInput.address,
                email: parsedInput.email || '',
                watchlist: [],
              });
              user = await userRepository.save(user);
            }

            context.request.session.user = { id: user.id };
            await context.request.session.save();
            return { success: true };
          } catch (err: any) {
            throw new Error("Login failed: " + err.message);
          }
        },
        toggleWatchlist: async (_: any, { coinId }: { coinId: string }, context: any): Promise<string[]> => {
          const userId = context.request.user?.id;
          if (!userId) {
            console.log("No user ID found in context, returning mock data");
            return [];
          }

          const userRepository = datasource.getRepository(User);
          const user = await userRepository.findOne({ where: { id: userId } });
          if (!user) throw new Error("User not found");

          let watchlist: string[] = user.watchlist || [];
          if (watchlist.includes(coinId)) {
            watchlist = watchlist.filter(id => id !== coinId);
          } else {
            watchlist.push(coinId);
          }

          user.watchlist = watchlist;
          await userRepository.update(user.id, { watchlist });

          return watchlist;
        },
      },
    },
    graphiql: true
  });

  return app;
}



// Start the server
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
