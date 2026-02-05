import { Navigate, type RouteObject } from 'react-router'

import AdminBusinessHours from '@/pages/admin/business_hours'
import AdminDashboard from '@/pages/admin/dashboard'
import AdminServices from '@/pages/admin/services'

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
      path: 'business-hours',
      element: <AdminBusinessHours />,
    },
    {
      path: 'services',
      element: <AdminServices />,
    },
    {
      path: '*',
      element: <Navigate to='/admin/dashboard' replace />,
    },
  ],
}
