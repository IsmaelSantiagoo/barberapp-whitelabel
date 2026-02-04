import { configureEcho } from '@laravel/echo-react'

const appMode = import.meta.env.VITE_APP_MODE
const localBarbershopId = import.meta.env.VITE_BARBERSHOP_ID

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token')
  const barbershopId =
    appMode === 'client' ? localBarbershopId : sessionStorage.getItem('active_barbershop_id')

  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Accept': 'application/json',
    'X-Barbershop-ID': barbershopId || '',
  }
}

configureEcho({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT ? parseInt(import.meta.env.VITE_REVERB_PORT) : 8080,
  wssPort: import.meta.env.VITE_REVERB_PORT ? parseInt(import.meta.env.VITE_REVERB_PORT) : 443,
  forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
  enabledTransports: ['ws', 'wss'],
  // Adicionar autorização para canais privados
  authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
  auth: {
    headers: getAuthHeaders(),
  },
})
