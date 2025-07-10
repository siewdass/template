import { useQuery as query, UseQueryResult } from '@tanstack/react-query'
//export { UseQueryResult } from '@tanstack/react-query'

const api = 'http://localhost:3001'

export const Fetch = async (endpoint: string, params: any) => {
  const query = new URLSearchParams(params).toString()

  const response = await fetch(`${api}${endpoint}?${query}`)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
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
  return query({
    queryKey: [ key, ...deps ],
    queryFn: () => Fetch( endpoint, params ),
  })
}