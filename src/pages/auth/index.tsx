import { useEffect, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Building2Icon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/hooks/use-theme'
import axios from '@/lib/axios'
import NotFound from '@/pages/NotFound'
import type { ApiResponse } from '@/types/api-response'
import type { BarberShop } from '@/types/consults'
import { phoneMask, phoneUnformatter } from '@/utils/formatters'

import {
  clientPhoneDefaults,
  clientPhoneSchema,
  defaultValues,
  schema,
  type ClientPhoneSchema,
  type Schema,
} from './schemas'

const appMode = import.meta.env.VITE_APP_MODE
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const localBarbershopId = import.meta.env.VITE_BARBERSHOP_ID

export default function AuthPage() {
  const { tokens } = useTheme()

  const params = new URLSearchParams(window.location.search)
  const [showPassword, setShowPassword] = useState(false)
  const [barbershopExists, setBarbershopExists] = useState<boolean | null>(null)
  const [checkingBarbershop, setCheckingBarbershop] = useState(appMode === 'client')
  const [barbershop, setBarbershop] = useState<BarberShop | null>(null)

  // Client auth state
  const [clientStep, setClientStep] = useState<'phone' | 'otp'>('phone')
  const [clientPhone, setClientPhone] = useState('')
  const [clientName, setClientName] = useState('')
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', ''])
  const [resendCountdown, setResendCountdown] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const form = useForm<Schema>({
    resolver: zodResolver(schema(params.get('register') === 'true')),
    defaultValues: defaultValues,
    mode: 'onSubmit',
  })

  const clientPhoneForm = useForm<ClientPhoneSchema>({
    resolver: zodResolver(clientPhoneSchema),
    defaultValues: clientPhoneDefaults,
    mode: 'onSubmit',
  })

  const navigate = useNavigate()
  const { signIn, signUp, requestOtp, verifyOtp, loading, setLoading, isAuthenticated } = useAuth()

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

          setBarbershop(response.data.data || null)
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

  // Countdown para reenvio de OTP
  useEffect(() => {
    if (resendCountdown <= 0) return
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCountdown])

  // Redirect if already authenticated
  if (isAuthenticated && appMode === 'admin') {
    navigate('/admin/dashboard')
    return null
  }

  if (isAuthenticated && appMode === 'client') {
    navigate('/home')
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
    setSubmitting(true)
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
      } finally {
        setSubmitting(false)
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
      } finally {
        setSubmitting(false)
      }
    }
  }

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  // --- Client Auth Handlers ---
  const handleClientPhoneSubmit = async (data: ClientPhoneSchema) => {
    setSubmitting(true)
    setClientPhone(data.phone)
    setClientName(data.name)

    const { success, message } = await requestOtp(data.phone, data.name)

    setSubmitting(false)

    if (!success) {
      toast.error(message)
      return
    }

    toast.success(message)
    setClientStep('otp')
    setResendCountdown(60)
    setOtpValues(['', '', '', '', '', ''])

    // Focus primeiro input OTP após render
    setTimeout(() => otpInputRefs.current[0]?.focus(), 100)
  }

  const handleOtpChange = (index: number, value: string) => {
    // Aceitar apenas dígitos
    if (value && !/^\d$/.test(value)) return

    const newValues = [...otpValues]
    newValues[index] = value
    setOtpValues(newValues)

    // Auto-avançar para o próximo input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }

    // Auto-submit quando todos preenchidos
    if (value && index === 5) {
      const code = newValues.join('')
      if (code.length === 6) {
        handleVerifyOtp(code)
      }
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 0) return

    const newValues = [...otpValues]
    for (let i = 0; i < 6; i++) {
      newValues[i] = pasted[i] || ''
    }
    setOtpValues(newValues)

    if (pasted.length === 6) {
      handleVerifyOtp(pasted)
    } else {
      otpInputRefs.current[pasted.length]?.focus()
    }
  }

  const handleVerifyOtp = async (code: string) => {
    setSubmitting(true)
    const { success, message } = await verifyOtp(clientPhone, code)
    setSubmitting(false)

    if (!success) {
      toast.error(message)
      setOtpValues(['', '', '', '', '', ''])
      otpInputRefs.current[0]?.focus()
      return
    }

    toast.success('Bem-vindo!')
    navigate('/home')
  }

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return

    setSubmitting(true)
    const { success, message } = await requestOtp(clientPhone, clientName)
    setSubmitting(false)

    if (!success) {
      toast.error(message)
      return
    }

    toast.success('Código reenviado!')
    setResendCountdown(60)
    setOtpValues(['', '', '', '', '', ''])
    otpInputRefs.current[0]?.focus()
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
                    disabled={submitting}
                    style={{
                      backgroundColor: tokens.primary,
                      borderColor: tokens.border,
                      color: tokens.onPrimary,
                    }}
                  >
                    {submitting && <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />}
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

  // --- Client Mode: Phone + OTP ---
  return (
    <div className='flex flex-col h-screen'>
      <div className='h-full flex flex-col justify-between py-10 px-10 gap-3'>
        <div className='flex flex-col h-full justify-between'>
          <div className='flex flex-col items-center justify-center h-full gap-3'>
            <Avatar className='w-30 h-30'>
              <AvatarImage src={barbershop?.logo_url || ''} />
              <AvatarFallback className='text-center'>
                {barbershop ? barbershop.company_name : ''}
              </AvatarFallback>
            </Avatar>
            <h1 className='text-2xl font-bold'>
              {clientStep === 'phone' ? 'Vamos Começar' : 'Verificação'}
            </h1>
            <h2 className='text-primary/50 text-center'>
              {clientStep === 'phone'
                ? 'Informe seus dados para agendar'
                : `Enviamos um código para o WhatsApp ${phoneMask(clientPhone)}`}
            </h2>
          </div>

          <div className='h-full'>
            {clientStep === 'phone' && (
              <Form {...clientPhoneForm}>
                <form
                  onSubmit={clientPhoneForm.handleSubmit(handleClientPhoneSubmit)}
                  className='space-y-6'
                >
                  <FormField
                    control={clientPhoneForm.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Nome</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupInput
                              {...field}
                              placeholder='Digite seu nome'
                              className='h-12'
                            />
                            <InputGroupAddon>
                              <UserIcon />
                            </InputGroupAddon>
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={clientPhoneForm.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Telefone</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupInput
                              placeholder='(00) 00000-0000'
                              value={phoneMask(field.value || '')}
                              onChange={(e) => {
                                const unformatted = phoneUnformatter(e.target.value)
                                if (unformatted.length <= 11) {
                                  field.onChange(unformatted)
                                }
                              }}
                              inputMode='tel'
                            />
                            <InputGroupAddon>
                              <PhoneIcon />
                            </InputGroupAddon>
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Field>
                    <Button
                      className='h-12 cursor-pointer border'
                      type='submit'
                      disabled={submitting}
                      style={{
                        backgroundColor: tokens.primary,
                        borderColor: tokens.border,
                        color: tokens.onPrimary,
                      }}
                    >
                      {submitting ? 'Enviando código no WhatsApp...' : 'Agendar agora'}
                    </Button>
                  </Field>
                </form>
              </Form>
            )}

            {clientStep === 'otp' && (
              <div className='space-y-6'>
                <div className='flex justify-center gap-2'>
                  {otpValues.map((val, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpInputRefs.current[i] = el
                      }}
                      type='text'
                      inputMode='numeric'
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      className='w-12 h-14 text-center text-xl font-bold rounded-md border border-input bg-transparent shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                      disabled={submitting}
                    />
                  ))}
                </div>

                <Field>
                  <Button
                    className='h-12 cursor-pointer border'
                    type='button'
                    disabled={submitting || otpValues.join('').length < 6}
                    onClick={() => handleVerifyOtp(otpValues.join(''))}
                    style={{
                      backgroundColor: tokens.primary,
                      borderColor: tokens.border,
                      color: tokens.onPrimary,
                    }}
                  >
                    {submitting ? 'Verificando...' : 'Verificar'}
                  </Button>
                </Field>

                <div className='text-center space-y-2'>
                  <button
                    type='button'
                    className='text-sm text-primary/70 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed'
                    disabled={resendCountdown > 0 || submitting}
                    onClick={handleResendOtp}
                  >
                    {resendCountdown > 0
                      ? `Reenviar código em ${resendCountdown}s`
                      : 'Reenviar código'}
                  </button>

                  <div>
                    <button
                      type='button'
                      className='text-sm text-primary/50 hover:text-primary'
                      onClick={() => {
                        setClientStep('phone')
                        setOtpValues(['', '', '', '', '', ''])
                      }}
                    >
                      Alterar número
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className='p-8 text-center text-xs text-muted-foreground'>
        Powered by BarberApp
      </footer>
    </div>
  )
}
