import { CalendarIcon, ClipboardListIcon, InfoIcon } from 'lucide-react'
import { useNavigate } from 'react-router'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'

export default function ClientHome() {
  const navigate = useNavigate()
  const { tokens } = useTheme()

  return (
    <div className='flex flex-col h-screen'>
      <div className='h-full flex flex-col justify-between py-50 px-10 gap-3'>
        <div className='flex items-center justify-center h-full flex-col gap-6'>
          <Avatar className='w-30 h-30'>
            <AvatarImage src='https://gcdnb.pbrd.co/images/Pv1pphJwk4Xd.jpg?o=1' />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h1 className='text-3xl font-bold text-center mb-2'>Cortês Barbearia</h1>
        </div>

        <Button
          onClick={() => navigate('/agendar')}
          className='h-12 cursor-pointer text-lg border'
          style={{
            backgroundColor: tokens.primary,
            borderColor: tokens.border,
            color: tokens.onPrimary,
          }}
        >
          <CalendarIcon />
          <span className='text-lg'>Agendar Horário</span>
        </Button>
        <Button
          onClick={() => navigate('/meus-agendamentos')}
          className='h-12 cursor-pointer'
          variant='outline'
        >
          <ClipboardListIcon />
          <span className='text-lg'>Meus Agendamentos</span>
        </Button>
        <Button
          onClick={() => navigate('/info-barbearia')}
          className='h-12 cursor-pointer'
          variant='ghost'
        >
          <InfoIcon />
          <span className='text-lg'>Informações da Barbearia</span>
        </Button>
      </div>

      <footer className='p-4 text-center text-xs text-muted-foreground dark:bg-black'>
        Powered by BarberApp
      </footer>
    </div>
  )
}
