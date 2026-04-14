import { type RouteObject } from 'react-router-dom'

import AuthPage from '@/pages/auth'

export const AuthRoute: RouteObject = {
  path: '/auth',
  children: [
    {
      path: 'login',
      element: <AuthPage />,
    },
  ],
}
