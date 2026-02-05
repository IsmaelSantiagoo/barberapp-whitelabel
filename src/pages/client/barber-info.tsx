import { ArrowLeft, Clock, Instagram, MapPin, Phone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function ClientInfoBarbershop() {
  const navigate = useNavigate()
  const { barbershop, loading } = useAuth()

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-muted-foreground'>Carregando...</p>
      </div>
    )
  }

  if (!barbershop) {
    return null
  }

  const formatTime = (time: string) => time.slice(0, 5)

  return (
    <div className='min-h-screen flex flex-col bg-background'>
      {/* Header */}
      <header className='border-b p-4'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' onClick={() => navigate(`/home`)}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <h1 className='font-semibold'>Informações</h1>
        </div>
      </header>

      {/* Content */}
      <main className='flex-1 p-4 space-y-4'>
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>{barbershop.company_name}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-start gap-3'>
              <MapPin className='h-5 w-5 text-muted-foreground shrink-0 mt-0.5' />
              <span>{barbershop.address || 'Não informado'}</span>
            </div>

            <a
              href={`tel:${barbershop.phone}`}
              className='flex items-center gap-3 hover:text-primary'
            >
              <Phone className='h-5 w-5 text-muted-foreground' />
              <span>{barbershop.phone || 'Não informado'}</span>
            </a>

            <a
              href={`https://instagram.com/${barbershop.instagram?.replace('@', '')}`}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-3 hover:text-primary'
            >
              <Instagram className='h-5 w-5 text-muted-foreground' />
              <span>{barbershop.instagram || 'Não informado'}</span>
            </a>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Clock className='h-5 w-5' />
              Horário de Funcionamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {DAYS.map((day, index) => {
                const hours = barbershop.business_hours.find((h) => h.day_of_week === index)
                return (
                  <div key={day} className='flex justify-between py-1 border-b last:border-0'>
                    <span className='font-medium'>{day}</span>
                    <span className={hours?.is_open ? '' : 'text-muted-foreground'}>
                      {hours?.is_open
                        ? `${formatTime(hours.open_time)} - ${formatTime(hours.close_time)}`
                        : 'Fechado'}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
