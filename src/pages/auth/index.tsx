import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import GoogleLogo from '@/assets/google.svg?react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
import { useAdminAuth } from '@/hooks/use-admin-auth'

import { defaultValues, schema, type Schema } from './schemas'

export default function AuthPage() {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
    mode: 'onSubmit',
  })

  const navigate = useNavigate()
  const { signIn, signUp, loading, isAuthenticated } = useAdminAuth()
  const params = new URLSearchParams(window.location.search)

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/admin/dashboard')
    return null
  }

  const handleSubmit = async (data: Schema) => {
    if (params.get('register') === 'true') {
      try {
        const { success, message } = await signUp(data.nome, data.email, data.senha)

        if (!success) {
          toast.error(message)
          return
        }

        navigate('/admin/dashboard')
      } catch (error) {
        console.error('Login error:', error)
        toast.error('Não foi possível fazer login. Tente novamente.')
      }
    } else {
      try {
        const { success, message } = await signIn(data.email, data.senha)

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

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-muted-foreground'>Carregando...</p>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-screen'>
      <div className='h-full flex flex-col justify-between py-10 px-10 gap-3'>
        <div className='flex flex-col h-full justify-between'>
          <div className='flex flex-col items-center justify-center h-full gap-3'>
            <Avatar className='w-30 h-30'>
              <AvatarImage src='https://gcdnb.pbrd.co/images/Pv1pphJwk4Xd.jpg?o=1' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h1 className='text-2xl font-bold'>Vamos Começar</h1>
            <h2 className='text-primary/50'>Bem Vindo! Entre com sua conta.</h2>
          </div>
          <div className='h-full'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                {params.get('register') === 'true' && (
                  <FormField
                    control={form.control}
                    name='nome'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex justify-between'>Nome</FormLabel>

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
                        <FormLabel>Email</FormLabel>

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
                  name='senha'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex justify-between'>
                        Senha
                        {params.get('register') !== 'true' && (
                          <a href='/forgot-password'>Esqueceu sua senha?</a>
                        )}
                      </FormLabel>

                      <FormControl>
                        <PasswordInput {...field} placeholder='Digite sua senha' className='h-12' />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Field>
                  <Button className='h-12 cursor-pointer' type='submit'>
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
