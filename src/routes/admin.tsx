import { type RouteObject } from 'react-router'

import AdminDashboard from '@/pages/admin/dashboard'

export const AdminRoutes: RouteObject = {
  path: 'admin',
  children: [
    {
      path: 'dashboard',
      element: <AdminDashboard />,
    },
  ],
}
