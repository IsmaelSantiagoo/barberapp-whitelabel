import { createContext, useEffect, useState, type ReactNode } from 'react'

import { toast } from 'sonner'

import axios from '@/lib/axios'
import type { Schema } from '@/pages/auth/schemas'
import { type ApiResponse } from '@/types/api-response'
import { type BarberShop, type User } from '@/types/consults'

interface AuthState {
  user: User | null
  token: string | null
  userRole: string | null
  barbershop: BarberShop | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  setLoading: (loading: boolean) => void
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signUp: (signUpData: Schema) => Promise<{ success: boolean; message: string }>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

const appMode = import.meta.env.VITE_APP_MODE
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('auth_token'),
    userRole: localStorage.getItem('user_role'),
    barbershop: null,
    loading: true,
  })

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }))
  }

  // Carrega os dados do usuário e barbershop ao inicializar se tiver token
  useEffect(() => {
    const loadAuthData = async () => {
      const token = localStorage.getItem('auth_token')

      if (!token) {
        setState((prev) => ({ ...prev, loading: false }))
        return
      }

      try {
        // Busca dados do usuário autenticado
        const userResponse = await axios.get<ApiResponse<User & { barbershop: BarberShop }>>(
          `${API_URL}/auth/me`
        )

        if (!userResponse.data.success) {
          throw new Error('Erro ao carregar usuário')
        }

        setState({
          user: userResponse.data.data,
          token,
          userRole: userResponse.data.data.role,
          barbershop: userResponse.data.data.barbershop,
          loading: false,
        })
      } catch (error) {
        console.error('Erro ao carregar dados de autenticação:', error)
        // Limpa dados inválidos
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_role')
        sessionStorage.removeItem('active_barbershop_id')
        setState({
          user: null,
          token: null,
          userRole: null,
          barbershop: null,
          loading: false,
        })
      }
    }

    loadAuthData()
  }, [])

  const logoutCleanup = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_role')
    sessionStorage.removeItem('active_barbershop_id')
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
      sessionStorage.setItem('active_barbershop_id', data.barbershop.id)

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

        const loginResult = await signIn(signUpData.email, signUpData.password)
        return loginResult
      } else {
        const response = await axios.post<ApiResponse>(`${API_URL}/auth/register`, {
          name: signUpData.owner_name,
          email: signUpData.email,
          password: signUpData.password,
          confirm_password: signUpData.password,
        })

        const { message } = response.data
        if (!response.data.success) throw new Error(message || 'Erro ao registrar')

        const loginResult = await signIn(signUpData.email, signUpData.password)
        return loginResult
      }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  const value: AuthContextType = {
    ...state,
    setLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!state.token && !!state.user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
