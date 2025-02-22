'use client';

import { useGetWatchlistQuery } from '@/lib/generated/graphql';
import { TrendingDown, TrendingUp } from 'lucide-react';
import Image from 'next/image';

const Watchlist = () => {
  const { data, isLoading, error } = useGetWatchlistQuery();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-3">
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
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-3">
        <h2 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Watchlist</h2>
        <p className="text-xs text-red-500">Error loading watchlist</p>
      </div>
    );
  }

  if (data.watchlist.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-3">
        <h2 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Watchlist</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Add coins to track them here</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-3">
      <h2 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Watchlist</h2>

      {/* Headers */}
      <div className="flex items-center justify-between px-2 mb-1">
        <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
          Asset
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 w-20 text-right">
            Price
          </span>
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 w-16 text-right">
            24h
          </span>
        </div>
      </div>

      {/* Coin List */}
      <div className="space-y-1">
        {data.watchlist.map((coin) => (
          <div
            key={coin.id}
            className="flex items-center justify-between min-h-[32px] hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2"
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
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {coin.symbol.toUpperCase()}
              </span>
            </div>

            {/* Right: Price and Change */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-900 dark:text-white w-20 text-right">
                ${coin.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
              <span
                className={`flex items-center justify-end text-xs w-16 ${coin.priceChangePercentage1d > 0
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watchlist;
