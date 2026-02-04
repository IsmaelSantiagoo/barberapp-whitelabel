import { useCallback, useEffect, useRef, useState } from 'react'

import { useEchoNotification } from '@laravel/echo-react'
import { Howl } from 'howler'
import { BellIcon } from 'lucide-react'
import { Link } from 'react-router'

// Importar o arquivo de áudio diretamente
import notificationAudio from '@/assets/notification.mp3'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip } from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/use-auth'
// Garante que o configureEcho é chamado
import axios from '@/lib/axios'
import dayjs from '@/lib/dayjs'
import '@/lib/echo'
import { cn } from '@/lib/utils'
import type { ApiResponse } from '@/types/api-response'

type NotificationType = 'info' | 'warning' | 'error' | 'success'

export interface Notification {
  id: string
  titulo?: string
  mensagem: string
  tipo: NotificationType
  link?: string
  data_envio: string
  lida: boolean
}

type NotificationPayload = {
  id: string
  titulo?: string
  mensagem: string
  tipo: NotificationType
  link?: string
  data_envio: string
  lida: boolean
}

export default function Notifications() {
  const { user } = useAuth()

  const scrollRef = useRef<HTMLDivElement>(null)
  const notificationSound = useRef<Howl | null>(null)
  const lastPlayTimeRef = useRef<number>(0)

  // Prevenir múltiplas reproduções em um curto período de tempo
  const PLAY_DEBOUNCE_MS = 500

  const [notifications, setNotifications] = useState<Notification[]>([])

  // Callback para processar notificações recebidas via WebSocket
  const handleNotification = useCallback((data: NotificationPayload) => {
    const newNotification: Notification = {
      id: data.id,
      titulo: data.titulo,
      mensagem: data.mensagem,
      tipo: (data.tipo as NotificationType) || 'info',
      link: data.link,
      data_envio: data.data_envio || new Date().toISOString(),
      lida: data.lida ?? false,
    }

    setNotifications((prev) => [...prev, newNotification])

    // Reproduzir som com debounce para evitar pool exhausted
    const now = Date.now()
    if (notificationSound.current && now - lastPlayTimeRef.current > PLAY_DEBOUNCE_MS) {
      try {
        notificationSound.current.play()
        lastPlayTimeRef.current = now
      } catch (error) {
        console.error('Erro ao tocar notificação:', error)
      }
    }
  }, [])

  useEchoNotification(`barber.${user?.id}.notifications`, handleNotification)

  // Inicializar o som apenas uma vez
  useEffect(() => {
    notificationSound.current = new Howl({
      src: [notificationAudio],
      volume: 0.3,
      preload: true,
      // Usar Web Audio API ao invés de HTML5 para evitar pool exhausted
      html5: false,
      onloaderror: (_, error) => {
        console.error('Erro ao carregar áudio de notificação:', error)
      },
      onplayerror: (_, error) => {
        console.error('Erro ao reproduzir áudio de notificação:', error)
        // Tentar desbloquear o áudio (pode ser necessário em alguns navegadores)
        notificationSound.current?.once('unlock', () => {
          notificationSound.current?.play()
        })
      },
    })

    return () => {
      notificationSound.current?.unload()
    }
  }, [])

  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.lida).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, lida: true } : n)))

    axios.post('/notifications/read', { id: [id] })
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, lida: true })))

    axios.post('/notifications/read', { id: notifications.map((n) => n.id) })
  }

  const fetchOldNotifications = async () => {
    try {
      const response = await axios.get<ApiResponse<Notification[]>>('/notifications')

      if (response.data.success) {
        const oldNotifications = response.data.data!

        setNotifications((prev) => [...oldNotifications, ...prev])
      }
    } catch {
      setNotifications([])
    }
  }

  useEffect(() => {
    fetchOldNotifications()
  }, [])

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        const container = scrollRef.current

        if (container) {
          container.scrollTop = container.scrollHeight
        }
      }, 50)

      return () => clearTimeout(timeout)
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Tooltip content='Notificações' align='center'>
          <Button variant='ghost' size='icon' className='size-7 relative'>
            <BellIcon />

            {unreadCount > 0 && (
              <span className='absolute top-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-red-500'></span>
            )}

            <span className='sr-only'>Notificações</span>
          </Button>
        </Tooltip>
      </PopoverTrigger>

      <PopoverContent className='w-lg p-0 select-none mt-3 -ml-13' align='start'>
        {notifications.length > 0 ? (
          <>
            <div className='flex items-center justify-between border-b px-4 py-2'>
              <h3 className='font-medium pl-3'>Notificações</h3>
              <Button
                variant='ghost'
                size='sm'
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className='text-xs text-muted-foreground hover:text-foreground'
              >
                Marcar todas como lidas
              </Button>
            </div>

            <div className='h-87.5 overflow-auto' ref={scrollRef}>
              {notifications.map((notification) => {
                const Component = notification.link ? Link : 'div'

                return (
                  <Component
                    key={notification.id}
                    to={notification.link!}
                    onClick={() => {
                      if (notification.link) setOpen(false)
                    }}
                  >
                    <div
                      className={cn({
                        'border-l-4 border-blue-500': !notification.lida,
                        'cursor-pointer': notification.link,
                      })}
                    >
                      <div
                        className={cn(
                          'flex gap-3 border-b p-4 transition-colors hover:bg-muted/50',
                          notification.lida ? 'opacity-70' : ''
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className='shrink-0 pt-1'>
                          <span
                            className={cn('block h-3 w-3 rounded-full', {
                              'bg-blue-500': notification.tipo === 'info',
                              'bg-amber-500': notification.tipo === 'warning',
                              'bg-red-500': notification.tipo === 'error',
                              'bg-green-500': notification.tipo === 'success',
                            })}
                          />
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-start justify-between gap-2'>
                            <p
                              className={cn(
                                'text-sm font-medium',
                                !notification.lida && 'font-semibold'
                              )}
                            >
                              {notification.titulo || 'Notificação'}
                            </p>

                            <span
                              className='text-[10px] text-muted-foreground whitespace-nowrap'
                              title={dayjs(notification.data_envio).format('DD/MM/YYYY HH:mm:ss')}
                            >
                              {dayjs(notification.data_envio).fromNow()}
                            </span>
                          </div>

                          <p className='mt-1 text-xs text-muted-foreground'>
                            {notification.mensagem}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Component>
                )
              })}
            </div>
          </>
        ) : (
          <div className='p-4 text-center text-gray-500'>
            <p>Nenhuma notificação no momento</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
