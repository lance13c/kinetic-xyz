'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export const LoginButton = () => {
  const { isAuthenticated, user, isLoading, error, login, logout } = useAuth();
  const [isClient, setIsClient] = useState(false);

  console.log("isAuthenticated", isAuthenticated);

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything until after hydration
  if (!isClient) {
    return null;
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex flex-col text-sm">
          <span className="text-gray-700 dark:text-gray-300">
            {user.web3Address.substring(0, 6)}...{user.web3Address.substring(user.web3Address.length - 4)}
          </span>
          {/* Only show email if it exists */}
          {user.email && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {user.email}
            </span>
          )}
        </div>
        <button
          onClick={logout}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 
                     dark:text-gray-200 dark:bg-gray-800 
                     rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 
                     transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start">
      <button
        onClick={login}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
                   dark:bg-blue-500 rounded-md 
                   hover:bg-blue-700 dark:hover:bg-blue-600 
                   focus:outline-none focus:ring-2 focus:ring-offset-2 
                   focus:ring-blue-500 disabled:opacity-50 
                   disabled:cursor-not-allowed transition-colors duration-200
                   flex items-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          'Connect Wallet'
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

// Optional NavbarLogin component that's more compact for navigation bars
export const NavbarLogin = () => {
  const { isAuthenticated, user, isLoading, login, logout } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm truncate max-w-[100px] text-gray-700 dark:text-gray-300">
          {user.web3Address.substring(0, 6)}...{user.web3Address.substring(user.web3Address.length - 4)}
        </span>
        <button
          onClick={logout}
          className="px-2 py-1 text-xs bg-transparent hover:bg-gray-100 
                     dark:hover:bg-gray-800 rounded transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      disabled={isLoading}
      className="px-3 py-1 text-sm font-medium text-blue-600 
                 dark:text-blue-400 hover:text-blue-700 
                 dark:hover:text-blue-300 disabled:opacity-50 
                 transition-colors duration-200 flex items-center"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        'Connect'
      )}
    </button>
  );
};

export default LoginButton;
