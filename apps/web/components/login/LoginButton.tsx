'use client';

import { useState } from 'react';

const LoginButton = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      if (typeof window.ethereum === 'undefined') {
        setError("MetaMask is not installed. Please install it.");
        return;
      }
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];
      setAddress(userAddress);
      
      // For demo purposes, we'll just simulate a successful login
      // In a real app, you would implement the signature verification as in your original code
      
      setTimeout(() => {
        setLoggedIn(true);
        setIsLoading(false);
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setAddress('');
  };

  return (
    <div>
      {loggedIn ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm truncate max-w-[120px] md:max-w-xs">
            {address.substring(0, 6)}...{address.substring(address.length - 4)}
          </span>
          <button 
            onClick={handleLogout}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <button 
          onClick={handleLogin}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Connecting...' : 'Login with MetaMask'}
        </button>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default LoginButton;
