import { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Building2Icon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import GoogleLogo from '@/assets/google.svg?react'
import Loader from '@/components/custom/loader'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription } from '@/components/ui/field'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input, PasswordInput } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/hooks/use-theme'
import axios from '@/lib/axios'
import NotFound from '@/pages/NotFound'
import type { ApiResponse } from '@/types/api-response'
import type { BarberShop } from '@/types/consults'

import { defaultValues, schema, type Schema } from './schemas'

const appMode = import.meta.env.VITE_APP_MODE
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const localBarbershopId = import.meta.env.VITE_BARBERSHOP_ID

export default function AuthPage() {
  const { tokens } = useTheme()

  const params = new URLSearchParams(window.location.search)
  const [showPassword, setShowPassword] = useState(false)
  const [barbershopExists, setBarbershopExists] = useState<boolean | null>(null)
  const [checkingBarbershop, setCheckingBarbershop] = useState(appMode === 'client')
  const [logoSrc, setLogoSrc] = useState<string | null>(null)

  const form = useForm<Schema>({
    resolver: zodResolver(schema(params.get('register') === 'true')),
    defaultValues: defaultValues,
    mode: 'onSubmit',
  })

  const navigate = useNavigate()
  const { signIn, signUp, loading, setLoading, isAuthenticated } = useAuth()

  // Verifica se a barbearia existe (apenas no modo client)
  useEffect(() => {
    const checkBarbershop = async () => {
      if (appMode !== 'client' || !localBarbershopId) {
        setCheckingBarbershop(false)
        setBarbershopExists(true)
        return
      }

      try {
        const response = await axios.get<ApiResponse<BarberShop>>(
          `${API_URL}/barber-shops/${localBarbershopId}`
        )

        if (response.data.success && response.data.data) {
          const primaryColor = response.data.data.primary_color

          if (primaryColor) {
            localStorage.setItem('barbershop_primary_color', primaryColor)
            window.dispatchEvent(new Event('barbershop-color-change'))
          }

          setLogoSrc(response.data.data.logo_url || null)
          setBarbershopExists(true)
        } else {
          localStorage.removeItem('barbershop_primary_color')
          window.dispatchEvent(new Event('barbershop-color-change'))
          setBarbershopExists(false)
        }
      } catch (error) {
        console.error('Erro ao verificar barbearia:', error)
        localStorage.removeItem('barbershop_primary_color')
        window.dispatchEvent(new Event('barbershop-color-change'))
        setBarbershopExists(false)
      } finally {
        setCheckingBarbershop(false)
        setLoading?.(false)
      }
    }

    checkBarbershop()
  }, [])

  // Redirect if already authenticated
  if (isAuthenticated && appMode === 'admin') {
    navigate('/admin/dashboard')
    return null
  }

  // Mostra loader enquanto verifica a barbearia
  if (checkingBarbershop) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader showMessage={true} />
      </div>
    )
  }

  // Se barbearia não existe (apenas no modo client)
  if (appMode === 'client' && barbershopExists === false) {
    return <NotFound />
  }

  const handleSubmit = async (data: Schema) => {
    if (params.get('register') === 'true') {
      try {
        const { success, message } = await signUp(data)

        if (!success) {
          toast.error(message)
          return
        }

        navigate('/admin/dashboard')
      } catch (error) {
        console.error('Register error:', error)
        toast.error('Não foi possível fazer registro. Tente novamente.')
      }
    } else {
      try {
        const { success, message } = await signIn(data.email, data.password)

        if (!success) {
          toast.error(message)
          return
        }

        navigate('/admin/dashboard')
      } catch (error) {
        console.error('Login error:', error)
        toast.error('Não foi possível fazer login. Tente novamente.')
      }
    }
  }

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  interface CustomizedMessage {
    subtitle: string
  }
  const customizedMessages = (): CustomizedMessage => {
    const registering = params.get('register') === 'true'

    if (registering) {
      return {
        subtitle:
          appMode === 'admin'
            ? 'Crie sua conta para gerenciar sua barbearia'
            : 'Cadastre-se para começar a agendar seus horários',
      }
    } else {
      return {
        subtitle:
          appMode === 'admin'
            ? 'Entre na sua conta para gerenciar sua barbearia'
            : 'Entre na sua conta para começar a agendar',
      }
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader showMessage={true} />
      </div>
    )
  }

  if (appMode === 'admin') {
    return (
      <div className='flex flex-col h-screen items-center justify-center'>
        <Card className='w-full max-w-sm'>
          <CardHeader>
            <CardTitle>Entre na sua conta</CardTitle>
            <CardDescription>Entre com seu email abaixo para acessar sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                {params.get('register') === 'true' && (
                  <FormField
                    control={form.control}
                    name='company_name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Nome da Barbearia</FormLabel>

                        <FormControl>
                          <InputGroup>
                            <InputGroupInput {...field} placeholder='Nome da sua barbearia' />
                            <InputGroupAddon>
                              <Building2Icon />
                            </InputGroupAddon>
                          </InputGroup>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {params.get('register') === 'true' && (
                  <FormField
                    control={form.control}
                    name='primary_color'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor Principal</FormLabel>

                        <FormControl>
                          <Input
                            {...field}
                            type='color'
                            placeholder='Selecione uma cor'
                            className='h-12'
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {params.get('register') === 'true' && (
                  <FormField
                    control={form.control}
                    name='owner_name'
                    render={(renderData) => {
                      const { ref: _ref, ...field } = renderData.field

                      return (
                        <FormItem>
                          <FormLabel required>Nome</FormLabel>

                          <FormControl>
                            <InputGroup>
                              <InputGroupInput {...field} placeholder='Digite seu nome' />
                              <InputGroupAddon>
                                <UserIcon />
                              </InputGroupAddon>
                            </InputGroup>
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                )}
                <FormField
                  control={form.control}
                  name='email'
                  render={(renderData) => {
                    const { ref: _ref, ...field } = renderData.field

                    return (
                      <FormItem>
                        <FormLabel required>Email</FormLabel>

                        <FormControl>
                          <InputGroup>
                            <InputGroupInput {...field} type='email' placeholder='seu@email.com' />
                            <InputGroupAddon>
                              <MailIcon />
                            </InputGroupAddon>
                          </InputGroup>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex justify-between'>
                        <FormLabel required>Senha</FormLabel>

                        <span className='text-sm text-primary/50'>
                          {params.get('register') !== 'true' && (
                            <a href='/forgot-password'>Esqueceu sua senha?</a>
                          )}
                        </span>
                      </div>

                      <FormControl>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder='****'
                          />
                          <InputGroupAddon>
                            <LockIcon />
                          </InputGroupAddon>
                          <InputGroupAddon align='inline-end' onClick={togglePassword}>
                            {showPassword ? (
                              <EyeIcon className='cursor-pointer' />
                            ) : (
                              <EyeOffIcon className='cursor-pointer' />
                            )}
                          </InputGroupAddon>
                        </InputGroup>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Field>
                  <Button
                    className='cursor-pointer border'
                    type='submit'
                    style={{
                      backgroundColor: tokens.primary,
                      borderColor: tokens.border,
                      color: tokens.onPrimary,
                    }}
                  >
                    {params.get('register') === 'true' ? 'Cadastrar' : 'Entrar'}
                  </Button>
                  <Button className='cursor-pointer' variant='outline' type='button'>
                    <GoogleLogo className='mr-2' />
                    {params.get('register') === 'true'
                      ? 'Cadastrar com Google'
                      : 'Entrar com Google'}
                  </Button>
                  <FieldDescription className='text-center'>
                    {params.get('register') === 'true'
                      ? 'Já possui uma conta? '
                      : 'Não possui uma conta? '}
                    <a href={params.get('register') === 'true' ? '?' : '?register=true'}>
                      {params.get('register') === 'true' ? 'Faça login' : 'Cadastre-se'}
                    </a>
                  </FieldDescription>
                </Field>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-screen'>
      <div className='h-full flex flex-col justify-between py-10 px-10 gap-3'>
        <div className='flex flex-col h-full justify-between'>
          <div className='flex flex-col items-center justify-center h-full gap-3'>
            <Avatar className='w-30 h-30'>
              <AvatarImage
                src={logoSrc || 'https://squealing-emerald-hue6zyv4nh.edgeone.app/full-light.png'}
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h1 className='text-2xl font-bold'>Vamos Começar</h1>
            <h2 className='text-primary/50'>{customizedMessages().subtitle}</h2>
          </div>
          <div className='h-full'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                {params.get('register') === 'true' && (
                  <FormField
                    control={form.control}
                    name='owner_name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Nome</FormLabel>

                        <FormControl>
                          <Input {...field} placeholder='Digite seu nome' className='h-12' />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name='email'
                  render={(renderData) => {
                    const { ref: _ref, ...field } = renderData.field

                    return (
                      <FormItem>
                        <FormLabel required>Email</FormLabel>

                        <FormControl>
                          <Input
                            {...field}
                            type='email'
                            placeholder='email@example.com'
                            className='h-12'
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex justify-between'>
                        <FormLabel required>Senha</FormLabel>

                        <span className='text-sm text-primary/50'>
                          {params.get('register') !== 'true' && (
                            <a href='/forgot-password'>Esqueceu sua senha?</a>
                          )}
                        </span>
                      </div>

                      <FormControl>
                        <PasswordInput {...field} placeholder='Digite sua senha' className='h-12' />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Field>
                  <Button
                    className='h-12 cursor-pointer border'
                    type='submit'
                    style={{
                      backgroundColor: tokens.primary,
                      borderColor: tokens.border,
                      color: tokens.onPrimary,
                    }}
                  >
                    {params.get('register') === 'true' ? 'Cadastrar' : 'Entrar'}
                  </Button>
                  <Button className='h-12 cursor-pointer' variant='outline' type='button'>
                    <GoogleLogo className='mr-2' />
                    {params.get('register') === 'true'
                      ? 'Cadastrar com Google'
                      : 'Entrar com Google'}
                  </Button>
                  <FieldDescription className='text-center'>
                    {params.get('register') === 'true'
                      ? 'Já possui uma conta? '
                      : 'Não possui uma conta? '}
                    <a href={params.get('register') === 'true' ? '?' : '?register=true'}>
                      {params.get('register') === 'true' ? 'Faça login' : 'Cadastre-se'}
                    </a>
                  </FieldDescription>
                </Field>
              </form>
            </Form>
          </div>
        </div>
      </div>

      <footer className='p-8 text-center text-xs text-muted-foreground'>
        Powered by BarberApp
      </footer>
    </div>
  )
}
