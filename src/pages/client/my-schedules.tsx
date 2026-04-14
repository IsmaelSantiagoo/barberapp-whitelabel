import { useEffect, useState } from 'react'

import { format, isBefore, parseISO, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Calendar, CalendarIcon, ClockIcon, XIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import Loader from '@/components/custom/loader'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTheme } from '@/hooks/use-theme'
import axios from '@/lib/axios'
import type { ApiResponse } from '@/types/api-response'
import type { Appointment } from '@/types/consults'

export default function MyAppointments() {
  const navigate = useNavigate()
  const { tokens } = useTheme()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [spinners, setSpinners] = useState({
    appointments: false,
    canceling: false,
  })
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    setSpinners((prev) => ({ ...prev, appointments: true }))

    try {
      const response = await axios.get<ApiResponse>('/appointments/client')

      const data = response.data.data

      if (response.data.success) {
        setAppointments((data || []) as Appointment[])
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
      toast.error('Não foi possível carregar seus agendamentos.')
    } finally {
      setSpinners((prev) => ({ ...prev, appointments: false }))
    }
  }

  const handleCancel = async (appointmentId: string) => {
    setSpinners((prev) => ({ ...prev, canceling: true }))

    try {
      const response = await axios.post<ApiResponse>(`/appointments/cancel/${appointmentId}`)

      if (response.data.success) {
        toast.success('Agendamento cancelado com sucesso.')
      }

      loadAppointments()
    } catch (error) {
      console.error('Error canceling appointment:', error)
      toast.error('Não foi possível cancelar o agendamento.')
    } finally {
      setCancelingId(null)
      setSpinners((prev) => ({ ...prev, canceling: false }))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '0':
        return <Badge variant='secondary'>Pendente</Badge>
      case '1':
        return <Badge className='bg-green-500'>Confirmado</Badge>
      case '2':
        return <Badge variant='destructive'>Cancelado</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  const canCancel = (appointment: Appointment) => {
    if (appointment.status === '2') return false
    const appointmentDate = parseISO(appointment.date)
    return !isBefore(appointmentDate, startOfDay(new Date()))
  }

  return (
    <div className='min-h-screen flex flex-col bg-background'>
      {/* Header */}
      <header className='border-b p-4'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' onClick={() => navigate(`/client/home`)}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <h1 className='font-semibold'>Meus Agendamentos</h1>
        </div>
      </header>

      {/* Content */}
      {spinners.appointments ? (
        <Loader className='flex-1' message='Carregando agendamentos...' showMessage />
      ) : (
        <main className='flex-1 p-4'>
          {appointments.length === 0 ? (
            <div className='text-center py-12'>
              <Calendar className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
              <h2 className='text-lg font-medium mb-2'>Nenhum agendamento</h2>
              <p className='text-muted-foreground mb-6'>Você ainda não tem agendamentos futuros</p>
              <Button
                className='border'
                onClick={() => navigate('/client/schedule')}
                style={{
                  backgroundColor: tokens.primary,
                  color: tokens.onPrimary,
                  borderColor: tokens.border,
                }}
              >
                Agendar Horário
              </Button>
            </div>
          ) : (
            <div className='space-y-3'>
              {appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent>
                    <div className='flex items-start justify-between mb-3'>
                      <div>
                        <h3 className='font-medium'>
                          {appointment.service?.name || 'Serviço removido'}
                        </h3>
                        {getStatusBadge(appointment.status)}
                      </div>
                      {canCancel(appointment) && (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='text-destructive'
                          onClick={() => setCancelingId(String(appointment.id))}
                        >
                          <XIcon className='h-5 w-5' />
                        </Button>
                      )}
                    </div>

                    <div className='space-y-1 text-sm text-muted-foreground'>
                      <div className='flex items-center gap-2'>
                        <CalendarIcon className='h-4 w-4' />
                        <span>
                          {format(parseISO(appointment.date), "EEEE, d 'de' MMMM", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <ClockIcon className='h-4 w-4' />
                        <span>{appointment.time.slice(0, 5)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Cancel Dialog */}
      <AlertDialog open={!!cancelingId} onOpenChange={() => setCancelingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              color='destructive'
              onClick={() => cancelingId && handleCancel(cancelingId)}
              disabled={spinners.canceling}
            >
              {spinners.canceling ? (
                <div className='flex gap-3'>
                  <Loader />
                  Confirmar Cancelamento
                </div>
              ) : (
                'Confirmar Cancelamento'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
