'use client';
import { useGetWatchlistQuery } from '@/lib/generated/graphql';
import { TrendingDown, TrendingUp } from 'lucide-react';
import Image from 'next/image';

const Watchlist = () => {
  const { data, isLoading, error } = useGetWatchlistQuery();

  if (isLoading) {
    return (
      <div className="@container bg-white dark:bg-gray-900 rounded-lg shadow p-3">
        <h2 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Watchlist</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="@container bg-white dark:bg-gray-900 rounded-lg shadow p-3">
        <h2 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Watchlist</h2>
        <p className="text-xs text-red-500">Error loading watchlist</p>
      </div>
    );
  }

  if (data.watchlist.length === 0) {
    return (
      <div className="@container bg-white dark:bg-gray-900 rounded-lg shadow p-3">
        <h2 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Watchlist</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Add coins to track them here</p>
      </div>
    );
  }

  return (
    <div className="@container bg-white dark:bg-gray-900 rounded-lg shadow p-3">
      <h2 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Watchlist</h2>

      {/* Grid Container */}
      <div className="grid gap-1">
        {/* Headers */}
        <div className="grid grid-cols-[1fr_auto] @[400px]:grid-cols-[1fr_auto_auto_auto] gap-3 px-2 mb-1">
          <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
            Asset
          </div>
          <div className="grid grid-cols-[5rem_4rem] @[400px]:grid-cols-[5rem_4rem_10rem_10rem] gap-3 items-center">
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 text-right">
              Price
            </span>
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 text-right">
              24h
            </span>
            <span className="hidden @[400px]:block text-[10px] font-medium text-gray-400 dark:text-gray-500 text-right">
              Market Cap
            </span>
            <span className="hidden @[400px]:block text-[10px] font-medium text-gray-400 dark:text-gray-500 text-right">
              Volume 24h
            </span>
          </div>
        </div>

        {/* Coin List */}
        <div className="space-y-1">
          {data.watchlist.map((coin) => (
            <div
              key={coin.id}
              className="grid grid-cols-[1fr_auto] @[400px]:grid-cols-[1fr_auto_auto_auto] gap-3 items-center min-h-[32px] hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2"
            >
              {/* Left: Icon and Symbol */}
              <div className="flex items-center space-x-2">
                <div className="relative w-5 h-5 flex-shrink-0">
                  <Image
                    src={coin.icon}
                    alt={coin.symbol}
                    fill
                    className="rounded-full"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {coin.symbol.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Right side content */}
              <div className="grid grid-cols-[5rem_4rem] @[400px]:grid-cols-[5rem_4rem_10rem_10rem] gap-3 items-center">
                <span className="text-sm text-gray-900 dark:text-white text-right">
                  ${coin.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
                <span
                  className={`flex items-center justify-end text-xs ${coin.priceChangePercentage1d > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                    }`}
                >
                  {coin.priceChangePercentage1d > 0 ? (
                    <TrendingUp size={12} className="mr-0.5" />
                  ) : (
                    <TrendingDown size={12} className="mr-0.5" />
                  )}
                  {Math.abs(coin.priceChangePercentage1d).toFixed(1)}%
                </span>
                <span className="hidden @[400px]:block text-sm text-gray-900 dark:text-white text-right">
                  ${coin.marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="hidden @[400px]:block text-sm text-gray-900 dark:text-white text-right">
                  ${coin.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Watchlist;
