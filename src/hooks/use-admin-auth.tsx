import { useEffect, useState } from 'react'

import axios from '@/lib/axios'
import { type ApiResponse } from '@/types/api-response'
import { type BarberShop, type Tenant, type User } from '@/types/consults'

interface AdminAuthState {
  user: User | null
  token: string | null
  userRole: string | null // No seu Laravel é o campo 'role' da tabela users
  barbershop: BarberShop | null
  loading: boolean
}

const appMode = import.meta.env.VITE_APP_MODE

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    token: localStorage.getItem('auth_token'),
    userRole: null,
    barbershop: null,
    loading: true,
  })

  // URL base da sua API Laravel
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('auth_token')
      const tenantSlug = sessionStorage.getItem('active_tenant')

      if (!token || !tenantSlug) {
        setState((prev) => ({ ...prev, loading: false }))
        return
      }

      try {
        // Chamada para o método 'auth/me' que criamos no Laravel
        const response = await axios.get<ApiResponse<User & { tenant: Tenant }>>(
          `${API_URL}/auth/me`
        )

        if (response.data.success) {
          const { data } = response.data
          // data.user e data.tenant vêm do seu AuthController@me
          setState({
            user: data,
            token: token,
            userRole: data.role,
            barbershop: data.tenant,
            loading: false,
          })

          window.location.href = `/admin/dashboard`
          console.log('Redirecionando para /admin/dashboard')
        } else {
          // Token inválido ou expirado
          logoutCleanup()
        }
      } catch (error) {
        console.error('Erro ao validar sessão:', error)
        setState((prev) => ({ ...prev, loading: false }))
      }
    }

    checkSession()
  }, [API_URL])

  const logoutCleanup = () => {
    localStorage.removeItem('auth_token')
    sessionStorage.removeItem('active_tenant')
    setState({
      user: null,
      token: null,
      userRole: null,
      barbershop: null,
      loading: false,
    })
  }

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.post<
        ApiResponse<{ user: User; tenant: Tenant; access_token: string }>
      >(`${API_URL}/auth/login`, {
        email,
        password,
      })

      const { data, message } = response.data

      if (!response.data.success) throw new Error(message || 'Erro ao fazer login')

      // Salvando no localStorage para persistência
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('user_role', data.user.role)
      sessionStorage.setItem('active_tenant', data.tenant.slug)

      setState({
        user: data.user,
        token: data.access_token,
        userRole: data.user.role,
        barbershop: data.tenant,
        loading: false,
      })

      return { success: true, message: 'Login realizado com sucesso!' }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  const signOut = async () => {
    try {
      await axios.post<ApiResponse>(`${API_URL}/auth/logout`)
    } catch (e) {
      console.error('Erro ao deslogar no servidor', e)
    } finally {
      logoutCleanup()
    }
  }

  // Adaptado para o seu RegisterTenantController
  const signUp = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (appMode !== 'client') {
        const response = await axios.post<ApiResponse>(`${API_URL}/register-tenant`, {
          name,
          email,
          password,
        })

        const { message } = response.data
        if (!response.data.success) throw new Error(message || 'Erro ao registrar')

        return { success: true, message: message }
      } else {
        const response = await axios.post<ApiResponse>(`${API_URL}/auth/register`, {
          name,
          email,
          password,
          confirm_password: password,
        })

        const { message } = response.data
        if (!response.data.success) throw new Error(message || 'Erro ao registrar')

        return { success: true, message: message }
      }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!state.token && !!state.user,
  }
}
