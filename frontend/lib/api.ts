import { useQuery as query, UseQueryResult } from '@tanstack/react-query'

const api = 'http://localhost:3001'

interface FetchProps {
  method: string
  endpoint: string 
  params: any
}

export const Fetch = async ({ method, endpoint, params }: FetchProps) => {
  const headers = { 'Content-Type': 'application/json' };
  const config: RequestInit = { method, headers };

  if (method === 'GET') {
    endpoint += `?${new URLSearchParams(params).toString()}`;
  } else  {
    config.body = JSON.stringify(params);
  }

  const response = await fetch(`${api}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

interface Query {
  key: string
  endpoint: string
  params?: Record<string, any>
}

interface Paginator {
  items: any
  total: number
}

export const useQuery = <T = any>({ key, endpoint, params }: Query, deps: any[] = []): UseQueryResult<Paginator> => {
  return query({
    queryKey: [ key, ...deps ],
    queryFn: () => Fetch( { method: 'GET', endpoint, params } ),
  })
}