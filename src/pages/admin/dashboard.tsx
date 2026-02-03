import { useEffect } from 'react'

import { useHeader } from '@/hooks/use-header'

export default function AdminDashboard() {
  const { setPageTitle } = useHeader()

  useEffect(() => {
    setPageTitle('Dashboard')
  }, [])

  return <div></div>
}
