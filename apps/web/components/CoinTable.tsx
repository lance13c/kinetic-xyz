'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import Image from 'next/image';
import {
  useGetMarketCoinsQuery,
  useGetWatchlistQuery,
  useToggleWatchlistMutation,
} from '../lib/generated/graphql';

const CoinTable = () => {
  // Get the browser's current locale for number formatting
  const userLocale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';

  // Use generated hook for fetching market coins, passing the default dataSource
  const { data: marketData, isLoading: coinsLoading, error: coinsError } =
    useGetMarketCoinsQuery({ limit: 10, page: 1, currency: 'usd' });
  const coins = marketData?.marketCoins;

  // Use generated hook for fetching the watchlist, passing the default dataSource
  const { data: watchlistData } = useGetWatchlistQuery();
  const watchlist = watchlistData?.watchlist;

  const queryClient = useQueryClient();
  // Use generated mutation hook for toggling watchlist items
  const { mutate: toggleWatchlist } = useToggleWatchlistMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetWatchlist'] });
    },
  });

  // Utility function to format numbers according to the user's locale
  const formatNumber = (num: number, isCurrency = true) => {
    if (num >= 1_000_000_000) {
      return `${isCurrency ? '$' : ''}${(num / 1_000_000_000).toLocaleString(userLocale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}B`;
    } else if (num >= 1_000_000) {
      return `${isCurrency ? '$' : ''}${(num / 1_000_000).toLocaleString(userLocale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}M`;
    } else {
      return `${isCurrency ? '$' : ''}${num.toLocaleString(userLocale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  };

  if (coinsLoading) {
    return <div className="flex justify-center p-8">Loading coins...</div>;
  }
  if (coinsError) {
    return <div className="flex justify-center p-8">Error loading coins.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800 font-[family-name:var(--font-geist-mono)]">
          <tr>
            <th className="px-2 py-3" />
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              24h %
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
              Market Cap
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
              Volume (24h)
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {coins?.map((coin) => (
            <tr key={coin.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-2 py-4 whitespace-nowrap">
                <button onClick={() => toggleWatchlist({ coinId: coin.id })} className="focus:outline-none">
                  <Star
                    size={18}
                    className={
                      watchlist && watchlist.find((watchlistCoin) => watchlistCoin.id === coin.id)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }
                  />
                </button>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Image src={coin.icon} alt={`${coin.symbol} icon`} width={24} height={24} className="mr-2" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {coin.symbol.toUpperCase()}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                ${coin.price.toLocaleString(userLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                <span className={coin.priceChangePercentage1d >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}>
                  {coin.priceChangePercentage1d >= 0 ? '+' : ''}{coin.priceChangePercentage1d.toFixed(2)}%
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                {formatNumber(coin.marketCap)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                {formatNumber(coin.volume24h)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoinTable;
