import { useState, useEffect, DependencyList, useRef } from 'react';

const api = 'http://localhost:3001'

export const useFetch = (endpoint: string, method: string, body: any, dependencies: DependencyList = []) => {
  const init = useRef( false )
  const [ response, setResponse ] = useState<any>({ data: null, isLoading: true})

  useEffect(() => {
    if (!init.current) {
      init.current = true

      fetch(`${api}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          //'Authorization': 'Bearer tu-token-aqui', 
        },
        body: JSON.stringify(body)
      })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json();
      })
      .then(data => setResponse({ data, isLoading: false }))
      .catch(error => {
        if (error.name !== 'AbortError') {
          setResponse({ data: null, isLoading: false })
        }
      })

    }
  }, dependencies )

  return response
}