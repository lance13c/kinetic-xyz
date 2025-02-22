export const fetcher = <TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit["headers"]
): (() => Promise<TData>) => {
  return async (): Promise<TData> => {
    const endpoint = process.env.GRAPHQL_ENDPOINT || 'http://localhost:3000/graphql';
    const defaultHeaders = { 'Content-Type': 'application/json' };
    const headers = { ...defaultHeaders, ...options };

    // Extract the operation name from the query.
    const opNameMatch = query.trim().match(/^(?:query|mutation|subscription)\s+([^\s({]+)/);
    const operationName = opNameMatch ? opNameMatch[1] : undefined;

    const body = {
      query,
      variables: variables || undefined,
      operationName,
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
      throw new Error(json.errors[0].message);
    }
    return json.data;
  };
};
