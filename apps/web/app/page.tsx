'use client';

import CoinTable from '@/components/CoinTable';
import Navbar from '@/components/Navbar';
import Watchlist from '@/components/WatchList';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function Home() {
  const [queryClient] = useState(() => new QueryClient())

  return (

    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 font-[family-name:var(--font-geist-sans)]">
          <Navbar />

          {/* Mobile Tabs - Only visible on small screens */}
          <div className="md:hidden">
            <Tabs defaultValue="market" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="market">Market</TabsTrigger>
                <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
              </TabsList>
              <TabsContent value="market" className="p-4">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
                  <CoinTable />
                </div>
              </TabsContent>
              <TabsContent value="watchlist" className="p-4">
                <Watchlist />
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop Layout - Hidden on small screens, visible on medium and up */}
          <div className="hidden md:flex flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="flex flex-1 space-x-8">
              {/* Main content area */}
              <div className="flex-1">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white font-[family-name:var(--font-geist-sans)]">Cryptocurrency Market</h1>
                  </div>
                  <CoinTable />
                </div>
              </div>

              {/* Sidebar/Watchlist */}
              <div className="w-80">
                <Watchlist />
              </div>
            </div>
          </div>
        </main>
      </AuthProvider>
    </QueryClientProvider>

  );
}
