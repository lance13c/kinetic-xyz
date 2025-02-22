
import { z } from 'zod';

// Schema for platform data (including Solana addresses)
const platformSchema = z.object({
  solana: z.string().nullish(),
}).catchall(z.unknown());

// Schema for market data in coin details
const marketDataSchema = z.object({
  current_price: z.object({
    usd: z.number(),
  }),
  price_change_percentage_24h: z.number(),
  market_cap: z.object({
    usd: z.number(),
  }),
  total_volume: z.object({
    usd: z.number(),
  }),
}).catchall(z.unknown());

// Schema for individual coin details from /coins/{id} endpoint
export const coinDetailsSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.object({
    large: z.string().url(),
    small: z.string().url(),
    thumb: z.string().url(),
  }),
  platforms: platformSchema,
  market_data: marketDataSchema,
}).catchall(z.unknown());

// Schema for market coins from /coins/markets endpoint
export const marketCoinSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string().url(),
  current_price: z.number(),
  market_cap: z.number(),
  total_volume: z.number(),
  price_change_percentage_24h: z.number().nullable(),
}).catchall(z.unknown());

// Schema for historical data points
const dataPointSchema = z.tuple([
  z.number(), // timestamp
  z.number(), // value
]);

// Schema for historical data from /coins/{id}/market_chart/range endpoint
export const historicalDataSchema = z.object({
  prices: z.array(dataPointSchema),
  market_caps: z.array(dataPointSchema),
  total_volumes: z.array(dataPointSchema),
});

// Schema for our formatted coin data
export const formattedCoinSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  icon: z.string().url(),
  price: z.number(),
  priceChangePercentage1d: z.number().nullable(),
  marketCap: z.number(),
  volume24h: z.number(),
  tokenAddress: z.string().nullable(),
  solscanLink: z.string().url().nullable(),
});

// Helper function to format coin data
export const formatCoinData = (coin: z.infer<typeof coinDetailsSchema>) => {
  const formatted = {
    id: coin.id,
    symbol: coin.symbol,
    icon: coin.image.large,
    price: coin.market_data.current_price.usd,
    priceChangePercentage1d: coin.market_data.price_change_percentage_24h,
    marketCap: coin.market_data.market_cap.usd,
    volume24h: coin.market_data.total_volume.usd,
    tokenAddress: coin.platforms.solana || null,
    solscanLink: coin.platforms.solana ? `https://solscan.io/token/${coin.platforms.solana}` : null,
  };

  return formattedCoinSchema.parse(formatted);
};

// Helper function to format market coin data
export const formatMarketCoin = (coin: z.infer<typeof marketCoinSchema>, details: { tokenAddress: string | null }) => {
  const formatted = {
    id: coin.id,
    symbol: coin.symbol,
    icon: coin.image,
    price: coin.current_price,
    priceChangePercentage1d: coin.price_change_percentage_24h,
    marketCap: coin.market_cap,
    volume24h: coin.total_volume,
    tokenAddress: details.tokenAddress,
    solscanLink: details.tokenAddress ? `https://solscan.io/token/${details.tokenAddress}` : null,
  };

  return formattedCoinSchema.parse(formatted);
};
