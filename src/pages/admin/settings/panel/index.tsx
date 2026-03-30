import { useEffect, useState } from 'react'

import { Bell, ChevronLeftIcon, Moon, Sun, Volume2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/hooks/use-auth'

const SETTINGS_KEY = 'admin_panel_settings'

interface PanelSettings {
  theme: 'light' | 'dark'
  notificationSound: boolean
  receiveNotifications: boolean
}

const defaultSettings: PanelSettings = {
  theme: 'light',
  notificationSound: true,
  receiveNotifications: true,
}

function loadSettings(): PanelSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) }
  } catch {
    // Ignore parsing errors and return default settings
  }
  return defaultSettings
}

export default function AdminPanelSettings() {
  const navigate = useNavigate()
  const { loading, isAuthenticated } = useAuth()

  const [settings, setSettings] = useState<PanelSettings>(loadSettings)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login')
    }
  }, [loading, isAuthenticated, navigate])

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings])

  const updateSetting = <K extends keyof PanelSettings>(key: K, value: PanelSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    toast.success('Configuração salva!')
  }

  return (
    <div className='min-w-2xl mx-auto space-y-6'>
      <Link to='/admin/settings' className='flex w-fit'>
        <Button variant='outline' size='sm'>
          <ChevronLeftIcon className='h-4 w-4' />
          Voltar
        </Button>
      </Link>

      <div>
        <h1 className='text-2xl font-bold hidden lg:block'>Configurações do Painel</h1>
        <p className='text-muted-foreground'>Personalize a experiência do painel administrativo</p>
      </div>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            {settings.theme === 'dark' ? <Moon className='h-5 w-5' /> : <Sun className='h-5 w-5' />}
            Aparência
          </CardTitle>
          <CardDescription>Escolha o tema do painel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-3'>
            <button
              onClick={() => updateSetting('theme', 'light')}
              className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                settings.theme === 'light'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <Sun className='h-8 w-8' />
              <span className='text-sm font-medium'>Claro</span>
            </button>
            <button
              onClick={() => updateSetting('theme', 'dark')}
              className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                settings.theme === 'dark'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <Moon className='h-8 w-8' />
              <span className='text-sm font-medium'>Escuro</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Bell className='h-5 w-5' />
            Notificações
          </CardTitle>
          <CardDescription>Configure como deseja receber alertas</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='receive-notifications' className='font-medium'>
                Receber Notificações
              </Label>
              <p className='text-sm text-muted-foreground'>
                Receba alertas de novos agendamentos e atualizações
              </p>
            </div>
            <Switch
              id='receive-notifications'
              checked={settings.receiveNotifications}
              onCheckedChange={(checked) => updateSetting('receiveNotifications', checked)}
            />
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='notification-sound' className='font-medium flex items-center gap-2'>
                <Volume2 className='h-4 w-4' />
                Som de Notificação
              </Label>
              <p className='text-sm text-muted-foreground'>
                Reproduzir som ao receber novas notificações
              </p>
            </div>
            <Switch
              id='notification-sound'
              checked={settings.notificationSound}
              onCheckedChange={(checked) => updateSetting('notificationSound', checked)}
              disabled={!settings.receiveNotifications}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
