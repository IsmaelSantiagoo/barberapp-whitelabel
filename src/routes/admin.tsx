import { Navigate, type RouteObject } from 'react-router'

import AdminDashboard from '@/pages/admin/dashboard'

export const AdminRoutes: RouteObject = {
  path: '',
  children: [
    {
      path: '',
      element: <Navigate to='/admin/dashboard' replace />,
    },
    {
      path: 'dashboard',
      element: <AdminDashboard />,
    },
    {
      path: '*',
      element: <Navigate to='/admin/dashboard' replace />,
    },
  ],
}
