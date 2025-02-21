'use client';

import { Star, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type Coin = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
};

// Mock data for coins
const mockCoins = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 60234.52, change24h: 2.34 },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 3214.75, change24h: -1.26 },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: 0.58, change24h: 5.78 },
  { id: 'solana', name: 'Solana', symbol: 'SOL', price: 168.43, change24h: 7.89 },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', price: 7.84, change24h: -0.45 },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', price: 36.92, change24h: 3.45 },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', price: 17.56, change24h: 1.23 },
  { id: 'uniswap', name: 'Uniswap', symbol: 'UNI', price: 7.32, change24h: -2.58 },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', price: 84.75, change24h: 0.67 },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', price: 0.78, change24h: -3.42 },
] satisfies Coin[];

// In a real app, you would fetch data from an API
const fetchCoins = () => {
  // Mock API call - would be replaced with actual API call
  return Promise.resolve(mockCoins);
};

const Watchlist = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchlistCoins, setWatchlistCoins] = useState<Coin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load watchlist from localStorage and fetch coins on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load watchlist from localStorage
        const savedWatchlist = localStorage.getItem('watchlist');
        const parsedWatchlist = savedWatchlist ? JSON.parse(savedWatchlist) : [];
        setWatchlist(parsedWatchlist);

        // Fetch coins (in a real app, this would be an API call)
        const fetchedCoins = await fetchCoins();
        setCoins(fetchedCoins);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading watchlist data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update watchlistCoins whenever the watchlist or coins change
  useEffect(() => {
    const filtered = coins.filter(coin => watchlist.includes(coin.id));
    setWatchlistCoins(filtered);
  }, [watchlist, coins]);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (coinId: string) => {
    if (!watchlist.includes(coinId)) {
      const newWatchlist = [...watchlist, coinId];
      setWatchlist(newWatchlist);
    }
  };

  const removeFromWatchlist = (coinId: string) => {
    const newWatchlist = watchlist.filter(id => id !== coinId);
    setWatchlist(newWatchlist);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white font-[family-name:var(--font-geist-sans)]">Watchlist</h2>
        <div className="flex justify-center py-4">
          <p className="text-gray-500 dark:text-gray-400">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Watchlist</h2>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">Your watchlist is empty</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Click the star icon next to any coin to add it to your watchlist</p>
        </div>
        <div className="mt-4">
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Quick Add</h3>
          <div className="grid grid-cols-2 gap-2">
            {coins.slice(0, 4).map((coin) => (
              <button
                key={coin.id}
                onClick={() => addToWatchlist(coin.id)}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="text-sm font-medium">{coin.symbol}</span>
                <Star size={16} className="text-gray-400" />
              </button>
            ))}
          </div>
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
        {watchlistCoins.map((coin) => (
          <li key={coin.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{coin.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{coin.symbol}</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">
                  ${coin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`text-sm ${
                  coin.change24h >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                }`}>
                  {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                </div>
              </div>
              <button
                onClick={() => removeFromWatchlist(coin.id)}
                className="text-gray-400 hover:text-red-500 focus:outline-none"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Watchlist;
