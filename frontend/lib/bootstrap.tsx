import { ReactNode, StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate, useRouteError, Outlet, useNavigate } from 'react-router'
import { PrimeReactProvider } from 'primereact/api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from './toast'
import { useNavigationStore } from './navigation'
import { useAuth } from './auth'

import 'primereact/resources/themes/lara-light-cyan/theme.css'
import 'primeicons/primeicons.css'

interface Bootstrap {
  layout: {
    element: React.ComponentType<{ children: ReactNode }>
    excluded: string[]
  }
  authorization: {
    endpoint: string
    redirect: {
      onlogin: string
      onlogout: string
    }
  }
}

const App = ( { children }: { children: ReactNode } ) => {
	const navigate = useNavigate()
	const { setNavigate } = useNavigationStore()

	useEffect( () => {
		setNavigate( navigate )
	}, [ navigate ] )

	return <>{children}</>
}

export const Bootstrap = async ( { layout, authorization }: Bootstrap ) => {
	useAuth.getState().setConfig( authorization )
	const queryClient = new QueryClient()

	const Fallback = () => {
		const { stack } = useRouteError() as Error
		return <>File error: {stack?.match( /(src\/.*?\.(jsx|tsx|js|ts))/ )?.[0]}</>
	}

	const files = ( import.meta as any ).glob( '../src/**/*.{tsx,jsx}', { eager: true } )

	const routes = Object.entries( files )
		.filter( ( [ _, module ]: any ) => typeof ( module as any ).default === 'function' )
		.map( ( [ route, module ] ) => {
			const Element = ( module as any ).default
			const path = route
				.replace( /^\.{0,2}\/src/, '' ) // ../src/ → ''
				.replace( /(?:\/index)?\.(tsx|jsx)$/, '' ) // quita .ts/.js y opcional /index
				.replace( /\[([^\]]+)]/g, ':$1' ) // [id] → :id
				.replace( /\/+$/, '' ) // barra final
				.replace( 'index', '' )
				.toLowerCase() || '/'

			return { path, element: <Element /> }
		} )

	const included = routes.filter( ( { path } ) => !layout.excluded.includes( path ) )
	const excluded = routes.filter( ( { path } ) => layout.excluded.includes( path ) )

	const router = createBrowserRouter( [
		{
			errorElement: <Fallback />,
			children: excluded,
			element: <App><Outlet /></App>
		},
		{
			element: (
				<App>
					<layout.element>
						<Outlet />
					</layout.element>
				</App>
			),
			errorElement: <Fallback />,
			children: included
		},
		{ path: '*', element: <Navigate to="/" replace /> }
	] )

	createRoot( document.getElementById( 'root' )! ).render(
		//<StrictMode>
		<PrimeReactProvider>
			<QueryClientProvider client={queryClient}>
				<ToastProvider>
					<RouterProvider router={router} />
				</ToastProvider>
			</QueryClientProvider>
		</PrimeReactProvider>
		//</StrictMode>
	)

	return {}
}
