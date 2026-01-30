import vanillaAxios, { type AxiosRequestHeaders } from 'axios'
import { toast } from 'sonner'

const apiBaseUrl = import.meta.env.VITE_API_URL
const tenantSlug = import.meta.env.VITE_TENANT_SLUG

if (!apiBaseUrl) throw new Error('VITE_API_URL is not defined')

const axios = vanillaAxios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  validateStatus: () => true, // Não lança exceção para 4xx/5xx
})

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')

  config.headers = config.headers || ({} as AxiosRequestHeaders)

  if (token) config.headers.Authorization = `Bearer ${token}`
  if (tenantSlug) config.headers['X-Tenant-Slug'] = tenantSlug

  return config
})

// Controle de toasts para evitar duplicatas
const toastCache = new Map<string, number>()
const TOAST_COOLDOWN = 3000 // 3 segundos

function showToastOnce(key: string, message: string, type: 'error' | 'warning' = 'error') {
  const now = Date.now()
  const lastShown = toastCache.get(key)

  if (!lastShown || now - lastShown > TOAST_COOLDOWN) {
    toastCache.set(key, now)
    if (type === 'error') {
      toast.error(message)
    } else {
      toast.warning(message)
    }
    return true
  }
  return false
}

axios.interceptors.response.use((response) => {
  if (response.status === 401) {
    // armazenar papel atual do usuário antes de limpar o localStorage
    const userRole = localStorage.getItem('user_role')
    const shouldRedirect = showToastOnce('401-error', 'Sessão expirada. Faça login novamente.')

    if (shouldRedirect) {
      setTimeout(() => {
        sessionStorage.clear()
        localStorage.clear()

        const isAdmin = userRole === 'admin' || userRole === 'owner'
        window.location.href = isAdmin ? '/admin/login' : '/auth/login'
      }, 1500)
    }
  }

  return response
})

export default axios
