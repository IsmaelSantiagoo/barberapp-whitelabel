import { Navigate, type RouteObject } from 'react-router'

import AdminBusinessHours from '@/pages/admin/business_hours'
import AdminDashboard from '@/pages/admin/dashboard'
import AdminServices from '@/pages/admin/services'
import AdminSettings from '@/pages/admin/settings'
import AdminAccountSettings from '@/pages/admin/settings/account'
import AdminPanelSettings from '@/pages/admin/settings/panel'

export const AdminRoutes: RouteObject = {
  index: true,
  element: <Navigate to='dashboard' replace />,
}

export const AdminRoutesChildren: RouteObject[] = [
  {
    index: true,
    element: <Navigate to='dashboard' replace />,
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
    element: <Navigate to='dashboard' replace />,
  },
]
