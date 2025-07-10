import { ReactNode, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate, useRouteError, Outlet } from 'react-router'
import { PrimeReactProvider } from 'primereact/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primeicons/primeicons.css';

interface Bootstrap {
  theme?: string
  layout?: React.ComponentType<{ children: ReactNode }>
  authorization?: {
    exposed: string[]
  }
}

export const Bootstrap = async ({ layout: Layout, authorization }: Bootstrap) => {
  const queryClient = new QueryClient()

  const RouterErrorFallback = () => {
    const { stack } = useRouteError() as Error;
    return <>File error: {stack?.match(/(src\/.*?\.(jsx|tsx|js|ts))/)?.[0]}</>
  }

  const files = (import.meta as any).glob('../src/**/*.{tsx,jsx}', { eager: true });

  const allRoutes = Object.entries(files)
    .filter(([_, module]: any) => typeof (module as any).default === 'function')
    .map(([route, module]) => {
      const Element = (module as any).default
      const path = route
      .replace(/^\.{0,2}\/src\//, '')          // ../src/ → ''
      .replace(/(?:\/index)?\.(tsx|jsx)$/, '') // quita .ts/.js y opcional /index
      .replace(/\[([^\]]+)]/g, ':$1')          // [id] → :id
      .replace(/\/+$/, '')                     // barra final
      .replace('index', '')
      .toLowerCase() || '/';

      return { path, element: <Element /> }
    })

  const withs = allRoutes.filter(({path}) => !authorization?.exposed.includes(path))
  const withouts = allRoutes.filter(({path}) => authorization?.exposed.includes(path))

  const router = createBrowserRouter([
    {
      errorElement: <RouterErrorFallback />,
      children: withouts.map(({path, element}) => ({ path, element }))
    },
    {
      element: Layout ? <Layout><Outlet /></Layout> : <Outlet />,
      errorElement: <RouterErrorFallback />,
      children: withs.map(({path, element}) => ({ path, element }))
    },
    {
      path: '*',
      element: <Navigate to="/" replace />
    }
  ])

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <PrimeReactProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </PrimeReactProvider>
    </StrictMode>
  )

  return {}
}
