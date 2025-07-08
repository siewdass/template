import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate, useRouteError, useNavigate, useParams, useLocation } from 'react-router'

export const Bootstrap = async ( {}: any ) => {
  const RouterErrorFallback = () => {
    const { stack } = useRouteError() as Error;
    return <>File error: {stack?.match(/(src\/.*?\.(jsx|tsx|js|ts))/)?.[0]}</>
  }

  const files = (import.meta as any).glob('../src/**/*.{tsx,jsx}', { eager: true });

  const router = createBrowserRouter([{
    path: '/',
    errorElement: <RouterErrorFallback />,
    children: [
      ...Object.entries(files)
      .filter(([_, module]: any) => typeof (module as any).default === 'function')
      .map(([route, module]) => {
        const path = route
            .replace(/^\.{0,2}\/src\//, '')        // ../src/ → ''
            .replace(/(?:\/index)?\.(tsx|jsx)$/, '') // quita .ts/.js y opcional /index
            .replace(/\[([^\]]+)]/g, ':$1')        // [id] → :id
            .replace(/\/+$/, '')                   // barra final
            .replace('index', '')
            .toLowerCase() || '/';

        console.log(path)
        const MyRoute = (module as any).default

        const Wrapper = () => {   
          return <MyRoute params={useParams()} navigate={useNavigate()} location={useLocation()} />
        }

        return { path, Component: Wrapper }
      }),
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }])

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )

  return {}
}
