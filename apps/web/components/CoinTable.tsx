'use client';

import AnimateWatchlistItem from '@/components/AnimateWatchlistItem'; // our animation component
import { useAuth } from '@/components/providers/AuthProvider';
import { useAnimatePosition } from '@/context/AnimatePositionRef';
import {
  CoinMarketData,
  useGetMarketCoinsQuery,
  useGetWatchlistQuery,
  useToggleWatchlistMutation,
} from '@kinetic/graphql';
import { useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';

const CoinTable = () => {
  const { isAuthenticated } = useAuth();
  const userLocale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  const { position } = useAnimatePosition();
  const queryClient = useQueryClient();

  const { data: marketData, isLoading: coinsLoading, error: coinsError } =
    useGetMarketCoinsQuery({ limit: 10, page: 1, currency: 'usd' }, {
      refetchInterval: 30_000, // Refetch every 30 seconds
    });
  const coins = marketData?.marketCoins;

  const { data: watchlistData } = useGetWatchlistQuery({}, { enabled: isAuthenticated, subscribed: true, });
  const watchlist = watchlistData?.watchlist;

  // Ref dictionary for coin image elements keyed by coin id.
  const coinImageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // State to hold the coin being animated.
  const [animatingCoin, setAnimatingCoin] = useState<{
    coin: CoinMarketData;
    startRect: DOMRect;
  } | null>(null);

  const { mutate: toggleWatchlist } = useToggleWatchlistMutation({
    onMutate: async ({ coinId }) => {
      const queryKey = ['GetWatchlist', {}] as const;
      await queryClient.cancelQueries({ queryKey });
      const previousWatchlist = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: any) => {
        console.info("old", old);
        const currentWatchlist: CoinMarketData[] = old?.watchlist || [];
        const coinToAdd = coins?.find(c => c.id === coinId);
        if (currentWatchlist.find((c) => c.id === coinId)) {
          // Remove coin if it's already in the watchlist
          console.info("coinId", coinId);
          return {
            ...old,
            watchlist: currentWatchlist.filter((c: any) => c.id !== coinId)
          };
        } else if (coinToAdd) {
          // Add coin if it's not in the watchlist
          console.info("coinToAdd", coinToAdd);
          return {
            ...old,
            watchlist: [...currentWatchlist, coinToAdd]
          };
        }
        return old;
      });

      return { previousWatchlist }
    },
    onError: (err, variables, context) => {
      if (context?.previousWatchlist) {
        queryClient.setQueryData(['GetWatchlist', {}], context.previousWatchlist);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['GetWatchlist', {}] });
    }
  });

  const handleAnimationComplete = (coinId: string) => {
    toggleWatchlist({ coinId });
    setAnimatingCoin(null);
  };

  // Handle click on the "Add to watchlist" button.
  const handleAddCoin = (coin: CoinMarketData) => {
    console.info('coin', coin);
    const coinImageEl = coinImageRefs.current[coin.id];
    if (coinImageEl && !watchlist?.find((watchlistCoin) => watchlistCoin.id === coin.id)) {
      console.log("did not find coin in watchlist", coin.id);
      const startRect = coinImageEl.getBoundingClientRect();
      setAnimatingCoin({ coin, startRect });
    } else {
      console.info('toggleWatchlist', coin.id);
      toggleWatchlist({ coinId: coin.id });
    }
  };

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
    <>
      {/* Render the coin table */}
      <div className="overflow-x-auto max-h-[550px] overflow-y-auto relative">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 font-[family-name:var(--font-geist-mono)] sticky top-0 z-10">
            <tr>
              {isAuthenticated && <th className="px-2 py-3" />}
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
              <tr key={coin.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {isAuthenticated && (
                  <td className="px-2 py-4 whitespace-nowrap">
                    <button
                      title="Add to watchlist"
                      onClick={() => handleAddCoin(coin)}
                      className="p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:bg-gray-100 dark:focus:bg-gray-800 focus-visible:outline-none transition-colors"
                    >
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
                )}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="relative w-5 h-5 flex-shrink-0 mr-2"
                      ref={(el) => {
                        coinImageRefs.current[coin.id] = el;
                      }}
                    >
                      <Image src={coin.icon} alt={`${coin.symbol} icon`} width={24} height={24} className="rounded-full" />
                    </div>
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

      {animatingCoin && position && (
        <AnimateWatchlistItem
          imageSrc={animatingCoin.coin.icon}
          startRect={animatingCoin.startRect}
          targetRect={position}
          duration={400}
          onAnimationComplete={() => handleAnimationComplete(animatingCoin.coin.id)}
        />
      )}
    </>
  );
};

export default CoinTable;
