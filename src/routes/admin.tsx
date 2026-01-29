import AdminLogin from '@/pages/admin/login'
import { Navigate, type RouteObject } from 'react-router'

export const AdminAuthRoutes: RouteObject = {
  path: 'admin',
  children: [
    {
      path: 'login',
      element: <AdminLogin />,
    },
    {
      path: '*',
      element: <Navigate to='/admin/login' replace />,
    },
  ],
}