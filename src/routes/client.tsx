import { type RouteObject } from 'react-router'

import ClientHome from '@/pages/client'

export const ClientRoutes: RouteObject = {
  path: '',
  children: [
    {
      path: 'home',
      element: <ClientHome />,
    },
  ],
}
