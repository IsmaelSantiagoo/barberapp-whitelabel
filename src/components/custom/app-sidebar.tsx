import * as React from 'react'

import { ClockIcon, LayoutDashboardIcon, ScissorsIcon, SettingsIcon } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'

import { SidebarMain } from './sidebar-main'
import { SidebarSecondary } from './sidebar-secondary'
import { SidebarUser } from './sidebar-user'

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  sidebarPrimary: [
    {
      title: 'Dashboard',
      url: '/admin/dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'Serviços',
      url: '/admin/services',
      icon: ScissorsIcon,
    },
    {
      title: 'Horários',
      url: '/admin/business-hours',
      icon: ClockIcon,
    },
  ],
  sidebarSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: SettingsIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { barbershop } = useAuth()

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className='data-[slot=sidebar-menu-button]:p-1.5!'>
              <a href='/admin/dashboard'>
                <ScissorsIcon className='size-5!' />
                <span className='text-base font-semibold'>{barbershop?.company_name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMain items={data.sidebarPrimary} />
        <SidebarSecondary items={data.sidebarSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  )
}
