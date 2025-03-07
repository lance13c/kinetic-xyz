import { useAuth } from '@/components/providers/AuthProvider';
import { BoundingBox, useAnimatePosition } from '@/context/AnimatePositionRef';
import { useGetWatchlistQuery, useToggleWatchlistMutation } from '@kinetic/graphql';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { TrendingDown, TrendingUp, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';

const COIN_Y_OFFSET = 80;

const Watchlist = () => {
  const { isAuthenticated } = useAuth();
  const { setPosition } = useAnimatePosition();
  const { data, isLoading, error } = useGetWatchlistQuery({}, {
    subscribed: true,
    staleTime: 0,
  });
  const listRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const prevWatchListLengthRef = useRef(data?.watchlist?.length || 0);

  const { mutate: toggleWatchlist } = useToggleWatchlistMutation({
    onMutate: async ({ coinId }) => {
      const queryKey = ['GetWatchlist', {}];
      await queryClient.cancelQueries({ queryKey });
      const previousWatchlist = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: any) => {
        const currentWatchlist = old?.watchlist || [];
        return {
          ...old,
          watchlist: currentWatchlist.filter((c: any) => c.id !== coinId)
        };
      });
      return { previousWatchlist };
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

  const recalculatePosition = useCallback(() => {
    if (listRef.current) {
      const children = listRef.current.children;
      if (children.length > 0) {
        const newItem = children[children.length - 1] as HTMLElement;
        const newItemRect = newItem.getBoundingClientRect();
        const relativeRect = {
          x: newItemRect.x,
          y: newItemRect.y + COIN_Y_OFFSET,
          top: newItemRect.top + COIN_Y_OFFSET,
          left: newItemRect.left,
          width: newItemRect.width,
          height: newItemRect.height,
        } satisfies BoundingBox;
        setPosition(relativeRect);
      }
    }
    prevWatchListLengthRef.current = data?.watchlist?.length || 0;
  }, [data, setPosition]);

  useEffect(() => {
    recalculatePosition();
  }, [data, recalculatePosition]);

  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.setQueryData(['GetWatchlist', {}], null);
      queryClient.removeQueries({ queryKey: ['GetWatchlist', {}] });
    }
  }, [isAuthenticated, queryClient]);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      );
    }

    if (error || !data) {
      return <p className="text-xs text-red-500">Error loading watchlist</p>;
    }

    if (!data.watchlist?.length) {
      return <p className="text-xs text-gray-500 dark:text-gray-400">Add coins to track them here</p>;
    }

    return (
      <div className="grid gap-2">
        <div className="grid grid-cols-[1fr_auto] @[675px]:grid-cols-[1fr_auto_auto_auto] gap-3 px-2">
          <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500">Asset</div>
          <div className="grid grid-cols-[5rem_4rem] @[675px]:grid-cols-[5rem_4rem_10rem_10rem] gap-3 items-center">
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 text-right">Price</span>
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 text-right">24h</span>
            <span className="hidden @[675px]:block text-[10px] font-medium text-gray-400 dark:text-gray-500 text-right">Market Cap</span>
            <span className="hidden @[675px]:block text-[10px] font-medium text-gray-400 dark:text-gray-500 text-right">Volume 24h</span>
          </div>
        </div>
        <AnimatePresence mode="sync">
          {data.watchlist.map((coin) => (
            <motion.div
              key={coin.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
              className="group h-8 relative m-0 flex items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2"
            >
              <div className="flex-1 flex items-center space-x-2">
                <div className="relative w-5 h-5 flex-shrink-0 mr-2">
                  <Image src={coin.icon} alt={coin.symbol} fill className="rounded-full" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {coin.symbol.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-20 text-right">
                  <span className="text-sm text-gray-900 dark:text-white">
                    ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-16 text-right">
                  <span
                    className={`inline-flex items-center text-xs ${coin.priceChangePercentage1d > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {coin.priceChangePercentage1d > 0 ? (
                      <TrendingUp size={12} className="mr-0.5" />
                    ) : (
                      <TrendingDown size={12} className="mr-0.5" />
                    )}
                    {Math.abs(coin.priceChangePercentage1d).toFixed(1)}%
                  </span>
                </div>
                <div className="hidden @[675px]:block w-40 text-right">
                  <span className="text-sm text-gray-900 dark:text-white">
                    ${coin.marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="hidden @[675px]:block w-40 text-right">
                  <span className="text-sm text-gray-900 dark:text-white">
                    ${coin.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
              <div className="group/button">
                <button
                  title="Remove from watchlist"
                  onClick={() => {
                    toggleWatchlist({ coinId: coin.id })
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-90 group-hover/button:opacity-100 p-1.5 rounded-sm group-hover:bg-gray-200 group-hover/button:bg-red-100 dark:group-hover:bg-gray-800 dark:group-hover/button:bg-red-900/50 focus:outline-none transition-all"
                >
                  <X
                    size={16}
                    className="text-gray-500 group-hover:text-gray-600 group-hover/button:text-red-600 dark:text-gray-400 dark:group-hover/button:text-red-400"
                  />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="@container bg-white dark:bg-gray-900 rounded-lg shadow p-3">
      <h2 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Watchlist</h2>
      <div style={{ transition: 'transform 0.3s ease' }}>
        <div ref={listRef} className="space-y-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Watchlist;
