'use client';

import { useGetWatchlistQuery } from '@/lib/generated/graphql';
import { Trash2 } from 'lucide-react';

const Watchlist = () => {
  // Using the generated hook with no variables
  const { data, isLoading, error } = useGetWatchlistQuery();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Watchlist</h2>
        <div className="flex justify-center py-4">
          <p className="text-gray-500 dark:text-gray-400">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Watchlist</h2>
        <div className="flex justify-center py-4">
          <p className="text-red-500">Error loading watchlist.</p>
        </div>
      </div>
    );
  }

  // Assuming data.watchlist is an array of strings (coin IDs)
  const watchlist = data.watchlist;

  if (watchlist.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Watchlist</h2>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">Your watchlist is empty</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Click the star icon next to any coin to add it to your watchlist
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Watchlist</h2>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-800">
        {watchlist.map((coinId) => (
          <li key={coinId} className="p-4 flex items-center justify-between">
            <div className="font-medium text-gray-900 dark:text-white">{coinId}</div>
            <button className="text-gray-400 hover:text-red-500 focus:outline-none">
              <Trash2 size={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Watchlist;
