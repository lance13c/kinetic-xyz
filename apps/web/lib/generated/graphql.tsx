import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { fetcher } from '../graphql-fetcher';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CoinHistoricalDataRange = {
  __typename?: 'CoinHistoricalDataRange';
  marketCaps: Array<Maybe<Array<Maybe<Scalars['Float']['output']>>>>;
  prices: Array<Maybe<Array<Maybe<Scalars['Float']['output']>>>>;
  totalVolumes: Array<Maybe<Array<Maybe<Scalars['Float']['output']>>>>;
};

export type CoinMarketData = {
  __typename?: 'CoinMarketData';
  icon: Scalars['String']['output'];
  id: Scalars['String']['output'];
  marketCap: Scalars['Float']['output'];
  price: Scalars['Float']['output'];
  priceChangePercentage1d: Scalars['Float']['output'];
  solscanLink?: Maybe<Scalars['String']['output']>;
  symbol: Scalars['String']['output'];
  tokenAddress?: Maybe<Scalars['String']['output']>;
  volume24h: Scalars['Float']['output'];
};

export type LoginInput = {
  address: Scalars['String']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  message: Scalars['String']['input'];
  signature: Scalars['String']['input'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  success: Scalars['Boolean']['output'];
  token?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  login: LoginResponse;
  logout: Scalars['Boolean']['output'];
  toggleWatchlist: Array<Scalars['String']['output']>;
};


export type MutationloginArgs = {
  input: LoginInput;
};


export type MutationtoggleWatchlistArgs = {
  coinId: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  coinHistoricalDataRange: CoinHistoricalDataRange;
  marketCoins: Array<CoinMarketData>;
  me?: Maybe<User>;
  users: Array<User>;
  watchlist: Array<CoinMarketData>;
};


export type QuerycoinHistoricalDataRangeArgs = {
  coinId: Scalars['String']['input'];
  currency: Scalars['String']['input'];
  from: Scalars['Int']['input'];
  precision?: InputMaybe<Scalars['String']['input']>;
  to: Scalars['Int']['input'];
};


export type QuerymarketCoinsArgs = {
  currency?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
  web3Address: Scalars['String']['output'];
};

export const namedOperations = {
  Query: {
    GetWatchlist: 'GetWatchlist',
    GetMarketCoins: 'GetMarketCoins'
  },
  Mutation: {
    ToggleWatchlist: 'ToggleWatchlist',
    Login: 'Login'
  }
}
export type GetWatchlistQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWatchlistQuery = { __typename?: 'Query', watchlist: Array<{ __typename?: 'CoinMarketData', id: string, symbol: string, icon: string, price: number, priceChangePercentage1d: number, marketCap: number, volume24h: number, tokenAddress?: string | null, solscanLink?: string | null }> };

export type ToggleWatchlistMutationVariables = Exact<{
  coinId: Scalars['String']['input'];
}>;


export type ToggleWatchlistMutation = { __typename?: 'Mutation', toggleWatchlist: Array<string> };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'LoginResponse', success: boolean, token?: string | null } };

export type GetMarketCoinsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetMarketCoinsQuery = { __typename?: 'Query', marketCoins: Array<{ __typename?: 'CoinMarketData', id: string, symbol: string, icon: string, price: number, priceChangePercentage1d: number, marketCap: number, volume24h: number, tokenAddress?: string | null, solscanLink?: string | null }> };



export const GetWatchlistDocument = `
    query GetWatchlist {
  watchlist {
    id
    symbol
    icon
    price
    priceChangePercentage1d
    marketCap
    volume24h
    tokenAddress
    solscanLink
  }
}
    `;

export const useGetWatchlistQuery = <
      TData = GetWatchlistQuery,
      TError = unknown
    >(
      variables?: GetWatchlistQueryVariables,
      options?: Omit<UseQueryOptions<GetWatchlistQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetWatchlistQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetWatchlistQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetWatchlist'] : ['GetWatchlist', variables],
    queryFn: fetcher<GetWatchlistQuery, GetWatchlistQueryVariables>(GetWatchlistDocument, variables),
    ...options
  }
    )};

export const ToggleWatchlistDocument = `
    mutation ToggleWatchlist($coinId: String!) {
  toggleWatchlist(coinId: $coinId)
}
    `;

export const useToggleWatchlistMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ToggleWatchlistMutation, TError, ToggleWatchlistMutationVariables, TContext>) => {
    
    return useMutation<ToggleWatchlistMutation, TError, ToggleWatchlistMutationVariables, TContext>(
      {
    mutationKey: ['ToggleWatchlist'],
    mutationFn: (variables?: ToggleWatchlistMutationVariables) => fetcher<ToggleWatchlistMutation, ToggleWatchlistMutationVariables>(ToggleWatchlistDocument, variables)(),
    ...options
  }
    )};

export const LoginDocument = `
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    success
    token
  }
}
    `;

export const useLoginMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<LoginMutation, TError, LoginMutationVariables, TContext>) => {
    
    return useMutation<LoginMutation, TError, LoginMutationVariables, TContext>(
      {
    mutationKey: ['Login'],
    mutationFn: (variables?: LoginMutationVariables) => fetcher<LoginMutation, LoginMutationVariables>(LoginDocument, variables)(),
    ...options
  }
    )};

export const GetMarketCoinsDocument = `
    query GetMarketCoins($limit: Int, $page: Int, $currency: String) {
  marketCoins(limit: $limit, page: $page, currency: $currency) {
    id
    symbol
    icon
    price
    priceChangePercentage1d
    marketCap
    volume24h
    tokenAddress
    solscanLink
  }
}
    `;

export const useGetMarketCoinsQuery = <
      TData = GetMarketCoinsQuery,
      TError = unknown
    >(
      variables?: GetMarketCoinsQueryVariables,
      options?: Omit<UseQueryOptions<GetMarketCoinsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMarketCoinsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMarketCoinsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetMarketCoins'] : ['GetMarketCoins', variables],
    queryFn: fetcher<GetMarketCoinsQuery, GetMarketCoinsQueryVariables>(GetMarketCoinsDocument, variables),
    ...options
  }
    )};
