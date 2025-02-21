'use client';

import { LoginMutation, useLoginMutation } from '@/lib/generated/graphql';
import { useState } from 'react';
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';
import { z } from 'zod';

type AccountAddress = `0x${string}`;

// Helper to generate a login message (replace with a backend-provided nonce if desired)
const generateLoginMessage = (address: string): string =>
  `Login to MyApp with address ${address} at ${new Date().toISOString()}`;

// Define a Zod schema to validate login input
const loginInputSchema = z.object({
  email: z.string().optional(),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address format"),
  message: z.string(),
  signature: z.string(),
});

const LoginButton = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [address, setAddress] = useState<AccountAddress | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountAddress | null>(null);

  // Use the generated login mutation hook from TanStack Query
  const { mutate: loginMutation } = useLoginMutation(
    {
      endpoint: '/graphql',
      fetchParams: { headers: { 'Content-Type': 'application/json' } }
    },
    {
      onSuccess: (data: LoginMutation) => {
        if (data.login?.success) {
          setLoggedIn(true);
        } else {
          setError("Login failed on server.");
        }
      },
      onError: (err: any) => {
        setError(err?.message || "An unknown error occurred");
      },
    }
  );


  // Function that signs the login message and calls the backend mutation
  const performLogin = async (accountAddress: AccountAddress) => {
    if (!window.ethereum) {
      setError("Ethereum wallet is not installed. Please install it.");
      return;
    }

    // Create wallet client using viem
    const walletClient = createWalletClient({
      chain: mainnet,
      transport: custom(window.ethereum),
    });

    // Generate and sign login message
    const message = generateLoginMessage(accountAddress);
    const signature = await walletClient.signMessage({
      message,
      account: accountAddress, // Use the selected account
    });

    // Validate login input using Zod
    const loginInput = {
      email: "", // Optional; populate if needed
      address: accountAddress,
      message,
      signature,
    };

    const parsedInput = loginInputSchema.safeParse(loginInput);
    if (!parsedInput.success) {
      setError(parsedInput.error.message);
      return;
    }

    // Call the backend login mutation via the generated hook
    loginMutation({ input: parsedInput.data });
    setAddress(accountAddress);
  };

  // Handler for initial login: fetch accounts from MetaMask
  const handleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      if (typeof window.ethereum === 'undefined') {
        setError("MetaMask is not installed. Please install it.");
        setIsLoading(false);
        return;
      }

      // Create wallet client using viem
      const walletClient = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum),
      });

      // Request accounts from MetaMask
      const fetchedAccounts = await walletClient.requestAddresses();
      if (fetchedAccounts.length === 0) {
        setError("No accounts found.");
      } else if (fetchedAccounts.length === 1) {
        // Only one account available, so proceed directly
        await performLogin(fetchedAccounts[0] as AccountAddress);
      } else {
        // Multiple accounts: let the user choose one
        setAccounts(fetchedAccounts);
        setSelectedAccount(fetchedAccounts[0] as AccountAddress); // default to the first account
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for confirming the selected account from the dropdown
  const handleAccountSelection = async () => {
    if (!selectedAccount) {
      setError("No account selected.");
      return;
    }
    setIsLoading(true);
    try {
      await performLogin(selectedAccount);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setAddress(null);
    setAccounts([]);
    setSelectedAccount(null);
  };

  return (
    <div>
      {loggedIn ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm truncate max-w-[120px] md:max-w-xs">
            {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <>
          {accounts.length > 1 ? (
            <div className="flex flex-col space-y-2">
              <select
                value={selectedAccount || ''}
                onChange={(e) => setSelectedAccount(e.target.value as AccountAddress)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300"
              >
                {accounts.map((acct) => (
                  <option key={acct} value={acct}>
                    {acct}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAccountSelection}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Continue with selected account'}
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
        </>
      )}
    </div>
  );
};

export default LoginButton;
