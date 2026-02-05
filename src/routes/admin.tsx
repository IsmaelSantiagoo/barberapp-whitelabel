import { Navigate, type RouteObject } from 'react-router'

import AdminBusinessHours from '@/pages/admin/business_hours'
import AdminDashboard from '@/pages/admin/dashboard'
import AdminServices from '@/pages/admin/services'
import AdminSettings from '@/pages/admin/settings'

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
      path: 'settings',
      element: <AdminSettings />,
    },
    {
      path: '*',
      element: <Navigate to='/admin/dashboard' replace />,
    },
  ],
}
