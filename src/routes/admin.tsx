import { Navigate, type RouteObject } from 'react-router'

import AdminBusinessHours from '@/pages/admin/business_hours'
import AdminDashboard from '@/pages/admin/dashboard'
import AdminServices from '@/pages/admin/services'
import AdminSettings from '@/pages/admin/settings'
import AdminAccountSettings from '@/pages/admin/settings/account'
import AdminPanelSettings from '@/pages/admin/settings/panel'

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
      path: 'settings/account',
      element: <AdminAccountSettings />,
    },
    {
      path: 'settings/panel',
      element: <AdminPanelSettings />,
    },
    {
      path: '*',
      element: <Navigate to='/admin/dashboard' replace />,
    },
  ],
}
