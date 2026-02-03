import { useEffect, useState } from 'react'

import { toast } from 'sonner'

import axios from '@/lib/axios'
import type { Schema } from '@/pages/auth/schemas'
import { type ApiResponse } from '@/types/api-response'
import { type BarberShop, type User } from '@/types/consults'

interface AuthState {
  user: User | null
  token: string | null
  userRole: string | null // No seu Laravel é o campo 'role' da tabela users
  barbershop: BarberShop | null
  loading: boolean
}

const appMode = import.meta.env.VITE_APP_MODE

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('auth_token'),
    userRole: null,
    barbershop: null,
    loading: true,
  })

  // URL base da sua API Laravel
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  const localBarbershopSlug = import.meta.env.VITE_BARBERSHOP_SLUG

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('auth_token')
      const barbershopSlug =
        appMode === 'client' ? localBarbershopSlug : sessionStorage.getItem('active_barbershop')

      if (!token || !barbershopSlug) {
        setState((prev) => ({ ...prev, loading: false }))
        return
      }

      try {
        // Chamada para o método 'auth/me' que criamos no Laravel
        const response = await axios.get<ApiResponse<User & { barbershop: BarberShop }>>(
          `${API_URL}/auth/me`
        )

        if (response.data.success) {
          const { data } = response.data
          // data.user e data.barbershop vêm do seu AuthController@me
          setState({
            user: data,
            token: token,
            userRole: data.role,
            barbershop: data.barbershop,
            loading: false,
          })
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
    sessionStorage.removeItem('active_barbershop')
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
        ApiResponse<{ user: User; barbershop: BarberShop; access_token: string }>
      >(`${API_URL}/auth/login`, {
        email,
        password,
        appMode,
      })

      const { data, message } = response.data

      if (!response.data.success) throw new Error(message || 'Erro ao fazer login')

      // Salvando no localStorage para persistência
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('user_role', data.user.role)
      sessionStorage.setItem('active_barbershop', data.barbershop.slug)

      setState({
        user: data.user,
        token: data.access_token,
        userRole: data.user.role,
        barbershop: data.barbershop,
        loading: false,
      })

      return { success: true, message: 'Login realizado com sucesso!' }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  const signOut = async () => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/auth/logout`)

      if (response.data.success) {
        window.location.href = '/auth/login'
      } else {
        toast.error(
          response.data.message ||
            'Erro ao deslogar. Entre em contato com o suporte caso o erro persista.'
        )
      }
    } catch (e) {
      console.error('Erro ao deslogar no servidor', e)
    } finally {
      logoutCleanup()
    }
  }

  // Adaptado para o seu RegisterBarbershopController
  const signUp = async (signUpData: Schema): Promise<{ success: boolean; message: string }> => {
    try {
      if (appMode !== 'client') {
        const response = await axios.post<ApiResponse>(`${API_URL}/register-barbershop`, {
          company_name: signUpData.company_name,
          owner_name: signUpData.owner_name,
          primary_color: signUpData.primary_color,
          email: signUpData.email,
          password: signUpData.password,
          password_confirmation: signUpData.password,
        })

        const { message } = response.data
        if (!response.data.success) throw new Error(message || 'Erro ao registrar')

        return { success: true, message: message }
      } else {
        const response = await axios.post<ApiResponse>(`${API_URL}/auth/register`, {
          name: signUpData.owner_name,
          email: signUpData.email,
          password: signUpData.password,
          confirm_password: signUpData.password,
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
