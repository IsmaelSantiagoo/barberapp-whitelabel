import { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeftIcon, SaveIcon, UserIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input, PasswordInput } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import axios from '@/lib/axios'
import { cn } from '@/lib/utils'
import type { ApiResponse } from '@/types/api-response'

import {
  emailDefaultValues,
  emailSchema,
  password_validations,
  passwordDefaultValues,
  passwordSchema,
  type EmailSchema,
  type PasswordSchema,
} from './schemas'

export default function AdminAccountSettings() {
  // ==================== Hooks ====================
  const { user, loading, refreshAuth } = useAuth()

  // ==================== States ====================
  const [spinners, setSpinners] = useState({
    submitting: {
      email: false,
      password: false,
    },
  })

  // ==================== Formulário ====================
  const emailForm = useForm<EmailSchema>({
    resolver: zodResolver(emailSchema),
    defaultValues: emailDefaultValues(user),
    mode: 'onSubmit',
  })

  const passwordForm = useForm<PasswordSchema>({
    resolver: zodResolver(passwordSchema),
    defaultValues: passwordDefaultValues(),
    mode: 'onSubmit',
  })

  const onSubmitEmail = async (values: EmailSchema) => {
    setSpinners((prev) => ({ ...prev, submitting: { email: true, password: false } }))
    try {
      const response = await axios.patch<ApiResponse>(`/users/change-email/${user?.id}`, values)
      const { data } = response

      if (data.success) {
        toast.success(data.message || 'E-mail atualizado')
        refreshAuth()
      } else {
        toast.error(
          data.message || 'Erro ao atualizar e-mail. Verifique suas informações e tente novamente.'
        )
      }
    } catch (error: any) {
      toast.error(`Erro ao atualizar e-mail: ${error.message}`)
    } finally {
      setSpinners((prev) => ({ ...prev, submitting: { email: false, password: false } }))
    }
  }

  const onSubmitPassword = async (values: PasswordSchema) => {
    setSpinners((prev) => ({ ...prev, submitting: { email: false, password: true } }))
    try {
      const response = await axios.patch<ApiResponse>(`/users/change-password/${user?.id}`, values)

      const { data } = response

      if (data.success) {
        toast.success(data.message || 'Senha atualizada com sucesso!')
        passwordForm.reset()
      } else {
        toast.error(
          data.message || 'Erro ao atualizar senha. Verifique suas informações e tente novamente.'
        )
      }
    } catch (error: any) {
      toast.error(`Erro ao atualizar senha: ${error.message}`)
    } finally {
      setSpinners((prev) => ({ ...prev, submitting: { email: false, password: false } }))
    }
  }

  // === VALIDAÇÕES DE SENHA ===
  const senha_antiga = passwordForm.watch('old_pass')
  const senha_nova = passwordForm.watch('new_pass')
  const confirmar_senha_nova = passwordForm.watch('confirm_new_pass')

  // setando erros no formulário de acordo com as validações
  useEffect(() => {
    if (
      password_validations(senha_antiga, senha_nova, confirmar_senha_nova).every(
        (v) => v.validation
      )
    ) {
      passwordForm.clearErrors()
      return
    }

    for (const password_validation of password_validations(
      senha_antiga,
      senha_nova,
      confirmar_senha_nova
    )) {
      const { title, validation, message } = password_validation

      if (['min8', 'sameAsCurrent', 'invalidPassword'].includes(title) && !validation) {
        passwordForm.setError('new_pass', {
          type: 'manual',
          message: message,
        })
      }

      if (title === 'match' && !validation) {
        passwordForm.setError('confirm_new_pass', {
          type: 'manual',
          message: message,
        })
      }
    }
  }, [passwordForm, senha_nova, confirmar_senha_nova])

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-muted-foreground'>Carregando...</p>
      </div>
    )
  }

  return (
    <div className='min-w-2xl mx-auto space-y-6'>
      <Link to='/admin/settings' className='flex'>
        <Button variant='outline' size='sm'>
          <ChevronLeftIcon className='h-4 w-4' />
          Voltar
        </Button>
      </Link>

      <div>
        <h1 className='text-2xl font-bold hidden lg:block'>Minha Conta</h1>
        <p className='text-muted-foreground'>Gerencie suas informações de acesso</p>
      </div>

      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <UserIcon className='h-5 w-5' />
            Dados da Conta
          </CardTitle>
          <CardDescription>Altere seu e-mail de acesso</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onSubmitEmail)}>
              <FormField
                control={emailForm.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='email@example.com' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button
            onClick={emailForm.handleSubmit(onSubmitEmail)}
            disabled={spinners.submitting.email}
            loading={spinners.submitting.email}
            size='sm'
          >
            <SaveIcon className='mr-2 h-4 w-4' />
            Atualizar E-mail
          </Button>
        </CardFooter>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>Defina uma nova senha para sua conta</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Form {...passwordForm}>
            <form className='space-y-3' onSubmit={passwordForm.handleSubmit(onSubmitPassword)}>
              <FormField
                control={passwordForm.control}
                name='old_pass'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} placeholder='********' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name='new_pass'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Nova</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} placeholder='********' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name='confirm_new_pass'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha Nova</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} placeholder='********' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* info de preenchimento de senha */}
              <Card className='p-3 gap-3'>
                <CardHeader className='p-0'>
                  <CardTitle>Sua nova senha precisa:</CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <ul className='text-sm text-muted-foreground space-y-1'>
                    {password_validations(senha_antiga, senha_nova, confirmar_senha_nova).map(
                      (validation) => (
                        <li
                          key={validation.title}
                          className={cn({
                            'text-green-400': validation.validation,
                            'text-red-400': !validation.validation,
                          })}
                        >
                          {validation.validation ? '✅' : '❌'} {validation.message}
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button
            onClick={passwordForm.handleSubmit(onSubmitPassword)}
            disabled={spinners.submitting.password}
            loading={spinners.submitting.password}
            size='sm'
          >
            <SaveIcon className='mr-2 h-4 w-4' />
            Atualizar Senha
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
