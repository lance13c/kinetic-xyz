'use client';

import {
  CoinMarketData,
  LoginMutation,
  useLoginMutation,
  User
} from '@/lib/generated/graphql';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { createWalletClient, custom, WalletClient } from 'viem';
import { mainnet } from 'viem/chains';
import { z } from 'zod';

// Schema validation matching GraphQL schema
const loginInputSchema = z.object({
  email: z.string().optional(),
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
    .transform(val => val as `0x${string}`),
  message: z.string(),
  signature: z
    .string()
    .regex(/^0x[a-fA-F0-9]+$/, "Invalid signature format")
    .transform(val => val as `0x${string}`),
});

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  watchlist: CoinMarketData[];
}

interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
    watchlist: []
  });
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

  // Use the generated login mutation hook
  const { mutate: loginMutation } = useLoginMutation({
    onSuccess: (data: LoginMutation) => {
      if (data.login?.success) {
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          error: null
        }));
        // After successful login, fetch user data and watchlist
        checkSession();
      } else {
        setState(prev => ({
          ...prev,
          error: "Login failed on server"
        }));
      }
    },
    onError: (err: any) => {
      setState(prev => ({
        ...prev,
        error: err?.message || "An unknown error occurred"
      }));
    }
  });

  useEffect(() => {
    initializeWalletClient();
    checkSession();
  }, []);

  const initializeWalletClient = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const client = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum)
      });
      setWalletClient(client);
    }
  };

  const checkSession = async () => {
    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetCurrentUser {
              me {
                id
                email
                web3Address
                createdAt
                updatedAt
              }
            }
          `
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.me) {
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            user: data.data.me,
            isLoading: false
          }));
          return;
        }
      }
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (err) {
      console.error('Session check failed:', err);
      setState(prev => ({
        ...prev,
        error: 'Session check failed',
        isLoading: false
      }));
    }
  };

  const login = async () => {
    if (!walletClient) {
      setState(prev => ({
        ...prev,
        error: "Wallet not connected"
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [address] = await walletClient.requestAddresses();
      const message = `Login to MyApp with address ${address} at ${new Date().toISOString()}`;

      const signature = await walletClient.signMessage({
        message,
        account: address,
      });

      const loginInput = {
        address,
        message,
        signature,
      };

      const parsedInput = loginInputSchema.safeParse(loginInput);
      if (!parsedInput.success) {
        throw new Error(parsedInput.error.message);
      }

      loginMutation({
        input: parsedInput.data
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : "An unknown error occurred"
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = async () => {
    try {
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
        watchlist: []
      });

      // Clear the session
      await fetch('/graphql', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation Logout {
              logout
            }
          `
        }),
      });
    } catch (err) {
      console.error('Logout failed:', err);
      setState(prev => ({
        ...prev,
        error: 'Logout failed'
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        checkSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
