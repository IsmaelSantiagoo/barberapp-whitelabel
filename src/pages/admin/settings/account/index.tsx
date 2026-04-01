import { useEffect, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  CameraIcon,
  ChevronLeftIcon,
  Loader2Icon,
  SaveIcon,
  Trash2Icon,
  UserIcon,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ==================== States ====================
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [removingPhoto, setRemovingPhoto] = useState(false)
  const [spinners, setSpinners] = useState({
    submitting: {
      email: false,
      password: false,
    },
  })

  // ==================== Foto de Perfil ====================
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    setUploadingPhoto(true)
    try {
      const response = await axios.post<ApiResponse>(`/users/change-photo/${user?.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (response.data.success) {
        toast.success(response.data.message || 'Foto atualizada com sucesso!')
        refreshAuth()
      } else {
        toast.error(response.data.message || 'Erro ao atualizar a foto.')
      }
    } catch (error: any) {
      toast.error(`Erro ao atualizar foto: ${error.message}`)
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handlePhotoRemove = async () => {
    setRemovingPhoto(true)
    try {
      const response = await axios.delete<ApiResponse>(`/users/remove-photo/${user?.id}`)
      if (response.data.success) {
        toast.success(response.data.message || 'Foto removida com sucesso!')
        refreshAuth()
      } else {
        toast.error(response.data.message || 'Erro ao remover a foto.')
      }
    } catch (error: any) {
      toast.error(`Erro ao remover foto: ${error.message}`)
    } finally {
      setRemovingPhoto(false)
    }
  }

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
    // só validar quando o usuário começou a digitar a nova senha
    if (!senha_nova && !confirmar_senha_nova) {
      passwordForm.clearErrors()
      return
    }

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

      {/* Foto de Perfil */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CameraIcon className='h-5 w-5' />
            Foto de Perfil
          </CardTitle>
          <CardDescription>Atualize sua foto de perfil</CardDescription>
        </CardHeader>
        <CardContent className='flex items-center gap-6'>
          <Avatar className='w-14 h-14'>
            <AvatarImage src={user?.profile_photo ?? undefined} alt={user?.name || undefined} />
            <AvatarFallback>{user?.name}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col gap-2'>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handlePhotoUpload}
            />
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant='outline'
                disabled={uploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingPhoto ? (
                  <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <CameraIcon className='mr-2 h-4 w-4' />
                )}
                {uploadingPhoto ? 'Enviando...' : 'Alterar Foto'}
              </Button>
              <Button
                size='sm'
                color='destructive'
                disabled={removingPhoto}
                onClick={handlePhotoRemove}
              >
                {removingPhoto ? (
                  <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <Trash2Icon className='mr-2 h-4 w-4' />
                )}
                {removingPhoto ? 'Removendo...' : 'Remover'}
              </Button>
            </div>
            <p className='text-xs text-muted-foreground'>JPG, PNG ou GIF. Tamanho máximo de 2MB.</p>
          </div>
        </CardContent>
      </Card>

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
