import { Navigate, type RouteObject } from 'react-router'

import AdminDashboard from '@/pages/admin/dashboard'
import AdminBusinessHours from '@/pages/admin/horarios'

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
      path: 'horarios',
      element: <AdminBusinessHours />,
    },
    {
      path: '*',
      element: <Navigate to='/admin/dashboard' replace />,
    },
  ],
}
