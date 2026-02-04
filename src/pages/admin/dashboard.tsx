import { useEffect, useState } from 'react'

import { AlertCircleIcon, CalendarIcon, CheckCircle2Icon } from 'lucide-react'
import { toast } from 'sonner'

import Loader from '@/components/custom/loader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useHeader } from '@/hooks/use-header'
import axios from '@/lib/axios'
import dayjs from '@/lib/dayjs'
import type { ApiResponse } from '@/types/api-response'
import type { Appointment } from '@/types/consults'
import { nameFormatter } from '@/utils/formatters'

export default function AdminDashboard() {
  const { setPageTitle } = useHeader()
  const [spinners, setSpinners] = useState({
    general: false,
  })

  useEffect(() => {
    setPageTitle('Dashboard')
  }, [])

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    confirmed: 0,
  })

  const fetchStats = async () => {
    setSpinners((prev) => ({ ...prev, general: true }))

    try {
      const response = await axios.get<ApiResponse<Appointment[]>>('/dashboard/today_appointments')

      if (response.data.success) {
        setAppointments(response.data.data)
        setStats({
          today: response.data.data.length,
          pending: response.data.data.filter((appointment) => appointment.status === '0').length,
          confirmed: response.data.data.filter((appointment) => appointment.status === '1').length,
        })
      } else {
        toast.error(response.data.message || 'Erro ao buscar agendamentos.')
      }
    } catch (error: any) {
      toast.error('Erro ao buscar estatísticas.', error)
    } finally {
      setSpinners((prev) => ({ ...prev, general: false }))
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const getStatusData = (status: string): { label: string; color: string } => {
    switch (status) {
      case '0':
        return { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400' }
      case '1':
        return { label: 'Confirmado', color: 'bg-green-500/20 text-green-400' }
      case '2':
        return { label: 'Cancelado', color: 'bg-red-500/20 text-red-400' }
      default:
        return { label: 'Desconhecido', color: 'default' }
    }
  }

  return (
    <div>
      {/* Content */}
      <div className='space-y-6'>
        {/* Welcome */}
        <div>
          <h1 className='text-2xl font-bold'>Olá! 👋</h1>
          <p className='text-muted-foreground'>
            {dayjs(new Date()).format('dddd, D [de] MMMM [de] YYYY')}
          </p>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardContent className='flex items-center gap-4'>
              <div className='p-3 rounded-full bg-blue-100 dark:bg-blue-600'>
                <CalendarIcon className='h-5 w-5 text-blue-600 dark:text-white' />
              </div>
              <div>
                <p className='text-2xl font-bold'>{spinners.general ? '...' : stats.today}</p>
                <p className='text-sm text-muted-foreground'>Hoje</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='flex items-center gap-4'>
              <div className='p-3 rounded-full bg-yellow-100 dark:bg-yellow-600'>
                <AlertCircleIcon className='h-5 w-5 text-yellow-600 dark:text-white' />
              </div>
              <div>
                <p className='text-2xl font-bold'>{spinners.general ? '...' : stats.pending}</p>
                <p className='text-sm text-muted-foreground'>Pendentes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='flex items-center gap-4'>
              <div className='p-3 rounded-full bg-green-100 dark:bg-green-600'>
                <CheckCircle2Icon className='h-5 w-5 text-green-600 dark:text-white' />
              </div>
              <div>
                <p className='text-2xl font-bold'>{spinners.general ? '...' : stats.confirmed}</p>
                <p className='text-sm text-muted-foreground'>Confirmados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos de Hoje</CardTitle>
            <CardDescription>{stats.today} agendamento(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {spinners.general ? (
              <Loader showMessage={true} message='Carregando agendamentos...' />
            ) : stats.today === 0 ? (
              <p className='text-muted-foreground'>Nenhum agendamento para hoje</p>
            ) : (
              <div className='space-y-3'>
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className='flex items-center justify-between p-3 rounded-lg bg-muted/50'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='text-center min-w-12.5'>
                        <p className='font-bold'>{apt.time.slice(0, 5)}</p>
                      </div>
                      <div>
                        <p className='font-medium'>{nameFormatter(apt.customer?.name)}</p>
                        <p className='text-sm text-muted-foreground'>{apt.service?.name}</p>
                      </div>
                    </div>
                    <Badge className={getStatusData(apt.status).color}>
                      {getStatusData(apt.status).label}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
