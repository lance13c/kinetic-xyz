# Kinetic Coin Marketplace

## Prerequisites

### Technology

* NodeJS Version v20.13.1
* `pnpm` 9.15.3 or greater
* Docker Desktop (to launch the database)
* Ethereum chain wallet with browser extension like Metamask. You will need the browser extension. (Only tested with metamask)

### Warnings

CoinGecko Too Many Requests - You can reach the CoinGecko if you refresh a lot on a demo api key. This will prevent the marketplace from loading.

## How to Run
At the root of the repository run the follow.

### ENV File
Simple way to generate 32 length secret:

```
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

In `apps/server/` add an env with:

```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=kinetic-db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
FASTIFY_SECRET=RANDOM_32_LENGTH_SECRET
COINGECKO_API_KEY=YOUR_API_KEY_HERE
```

### Commands

1. `pnpm install` - Installs all packages
1. `pnpm dev:setup` - This compiles typeorm & sets up the graphql
1. `pnpm db:start` - Starts the database
1. `pnpm dev` - Starts the the database, then runs the server and web client

The graphql server is hosted on port 3001
The webapp is hosted on port 3000

### Others
You might want to reload the VS Code after running `pnpm dev` because the types in files might still be erroring.
You may need to run `pnpm install` again after `pnpm dev:setup`.

## Production Deploy

This is not ready for a production deploy.
However if we were to do it I'd run the database and server on replicate and the nextjs portion on Vercel.
We would need to correctly configure CORS, and handle authentication in a more professional way.

## Architecture
This is monorepo built with `pnpm` with the goal of keeping the apps and helper packages separated.

### Authentication

For authentication I setup a very basic web3 login using the Ethereum chain wallet. It is a simple custom authentication setup.
For to access the wallet information I used `viem` package.

Login works the same as signup except if there isn't an existing user I create one.

This can be better in multiple ways.
1. It should be using a nonce from the server for the initial message.
2. We can use an existing library like next auth or similar that can help with session management.


### Backend

For the backend I went with Fastify, GraphQL, and TypeORM test out how it feels code and get the bonus points.
I've never worked Fastify or TypeORM before, and only setup GraphQL from scratch once before. Getting this configured correctly took most of my time.


### Frontend

For the frontend I used the frontend part of NextJS with all the tools mentioned Tailwind CSS, Radix Components, React Query, GraphQL Codegen, and Zod (for the bonus points).


### The App Design

The page is split into two columns. On the left is the marketplace, and on the right is the watchlist.

I thought about the design for a while and experimented with AI design tools. Every tool always generated the watchlist in a separate tab, but I thought this wasn't the best design. If I was the user, I'd want to see my watchlist right when I entered the app, but I also see the value is quickly being able to find new tokens and see the marketplace.

In my mind the best solution was to have the watchlist on the same homepage as the marketplace, but only visible if the user is logged in.

On mobile we can put the watchlist behind the a separate tab, but on desktop it should always be visible.

Interactions of adding and removing it from the watchlist should appear instantly, which means we need some kind of local state.
Instead of setting up extra local state providers I decided to use react query and its mutations to quickly update the local cache of the app. In my experience this isn't always the prettiest way in terms of a developer's perspective, but was quick and efficient and did not require any more packages. It think it works quite well for this simple app.

## Docker

Docker is used to launch the database in development. Everything else is run locally.

The docker compose could possibly be used to launch the database and server on replicate on the future.
Nextjs is best served on Vercel.

## Next Steps
* Allow Searching for coins
* Add pagination to the UI
* Optimize API calls to coingekco
* Remove auto sync database schema
* Check the numbers to ensure they are correct
