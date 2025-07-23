import { useState, useEffect, DependencyList, useRef } from 'react'
import { api } from './api'

export const useFetch = (endpoint: string, method: string, body: object, dependencies: DependencyList = []) => {
	const init = useRef(false)
	const [ response, setResponse ] = useState<object>({ data: null, isLoading: true })

	useEffect(() => {
		if (!init.current) {
			init.current = true

			fetch(`${api.url}${endpoint}`, {
				method,
				headers: {
					'Content-Type': 'application/json',
					//'Authorization': 'Bearer tu-token-aqui', 
				},
				body: JSON.stringify(body)
			})
				.then(res => {
					if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
					return res.json()
				})
				.then(data => setResponse({ data, isLoading: false }))
				.catch(error => {
					if (error.name !== 'AbortError') {
						setResponse({ data: null, isLoading: false })
					}
				})

		}
	}, dependencies)

	return response
}