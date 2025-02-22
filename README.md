# Kinetic Coin Marketplace

## Prerequisites

### Technology

* NodeJS Version v20.13.1
* `pnpm` 9.15.3 or greater
* Docker Desktop
* Ethereum chain wallet with browser extension like Metamask. You will need the browser extension. (I only tested it with metamask)


## How to Run



## Architecture
This is monorepo built with `pnpm` with the goal of keeping the apps and helper packages separated.

### Authentication

For authentication I setup web3 login using the Ethereum chain wallet. It is a simple custom authentication setup.
For to access the wallet information I used `viem` package.

I works like.....


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


## Next Steps
* Allow Searching for coins
* Add pagination to the UI


TODO

* Sort Coin Table by Market Cap.
