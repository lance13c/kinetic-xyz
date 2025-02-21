'use client';

import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

// Mock data for coins
const mockCoins = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 60234.52, change24h: 2.34, marketCap: 1142567000000, volume24h: 23563000000 },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 3214.75, change24h: -1.26, marketCap: 384950000000, volume24h: 15684000000 },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: 0.58, change24h: 5.78, marketCap: 19546000000, volume24h: 856300000 },
  { id: 'solana', name: 'Solana', symbol: 'SOL', price: 168.43, change24h: 7.89, marketCap: 67853000000, volume24h: 4521000000 },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', price: 7.84, change24h: -0.45, marketCap: 9854600000, volume24h: 367500000 },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', price: 36.92, change24h: 3.45, marketCap: 12658000000, volume24h: 875400000 },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', price: 17.56, change24h: 1.23, marketCap: 9532000000, volume24h: 542800000 },
  { id: 'uniswap', name: 'Uniswap', symbol: 'UNI', price: 7.32, change24h: -2.58, marketCap: 4265000000, volume24h: 235600000 },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', price: 84.75, change24h: 0.67, marketCap: 6235000000, volume24h: 412900000 },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', price: 0.78, change24h: -3.42, marketCap: 7234000000, volume24h: 358700000 },
];

type Coin = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
};

const CoinTable = () => {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch data from an API
    setCoins(mockCoins);
    setIsLoading(false);
    
    // Load watchlist from localStorage
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (e) {
        console.error('Failed to parse watchlist from localStorage:', e);
      }
    }
  }, []);

  const formatNumber = (num: number, isCurrency = true) => {
    if (num >= 1000000000) {
      return `${isCurrency ? '$' : ''}${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `${isCurrency ? '$' : ''}${(num / 1000000).toFixed(2)}M`;
    } else {
      return `${isCurrency ? '$' : ''}${num.toFixed(2)}`;
    }
  };

  const toggleWatchlist = (coinId: string) => {
    let newWatchlist;
    if (watchlist.includes(coinId)) {
      newWatchlist = watchlist.filter(id => id !== coinId);
    } else {
      newWatchlist = [...watchlist, coinId];
    }
    setWatchlist(newWatchlist);
    localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading coins...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800 font-[family-name:var(--font-geist-mono)]">
          <tr>
            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"></th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">24h %</th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Market Cap</th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">Volume (24h)</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {coins.map((coin) => (
            <tr key={coin.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-2 py-4 whitespace-nowrap">
                <button
                  onClick={() => toggleWatchlist(coin.id)}
                  className="focus:outline-none"
                >
                  <Star
                    size={18}
                    className={
                      watchlist.includes(coin.id)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }
                  />
                </button>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {coin.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {coin.symbol}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                ${coin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                <span className={`${
                  coin.change24h >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                }`}>
                  {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
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
