import { useQuery as reactQuery, UseQueryResult } from '@tanstack/react-query'
import { useToast } from './toast';
import { useEffect } from 'react';

const api = 'http://localhost:3001'

interface FetchProps {
  method: string
  endpoint: string 
  params: any
}

export const Fetch = async ({ method, endpoint, params }: FetchProps) => {
  // Obtener token del localStorage
  const token = localStorage.getItem('token');
  console.log('token', token)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  // Agregar Authorization header si existe el token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = { method, headers };

  if (method === 'GET') {
    endpoint += `?${new URLSearchParams(params).toString()}`;
  } else  {
    config.body = JSON.stringify(params);
  }

  let response 
  try {
    response = await fetch(`${api}${endpoint}`, config);
    return await response.json();
  } catch (error) {
    console.log('catch',error)  
  }
}

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
  const { show } = useToast();

  const query = reactQuery({
    queryKey: [ key, ...deps ],
    queryFn: () => Fetch( { method: 'GET', endpoint, params } ),
  })

  useEffect(() => {
    if (query.error) {
      show()
    }
  }, [query.error])

  return query
}