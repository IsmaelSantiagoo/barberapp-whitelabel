import { z } from 'zod'

const appMode = import.meta.env.VITE_APP_MODE

export const schema = (registering: boolean) =>
  z
    .object({
      company_name: z.string().optional(),
      primary_color: z.string().optional(),
      owner_name: z.string().optional(), // obrigatório apenas no registro
      email: z.string().min(1, 'O email é obrigatório'),
      password: z.string().min(1, 'A senha é obrigatória'),
    })
    .refine(
      (data) => {
        if (registering) {
          return !!data.owner_name && data.owner_name.trim().length > 0
        }
        return true
      },
      {
        message: 'O nome do proprietário é obrigatório',
        path: ['owner_name'],
      }
    )
    .refine(
      (data) => {
        // Apenas valida company_name se for appMode admin
        if (registering && appMode === 'admin') {
          return !!data.company_name && data.company_name.trim().length > 0
        }
        return true
      },
      {
        message: 'O nome da empresa é obrigatório',
        path: ['company_name'],
      }
    )
    .refine(
      (data) => {
        // Apenas valida primary_color se for appMode admin
        if (registering && appMode === 'admin') {
          return !!data.primary_color && data.primary_color.trim().length > 0
        }
        return true
      },
      {
        message: 'A cor principal é obrigatória',
        path: ['primary_color'],
      }
    )

export type Schema = z.infer<ReturnType<typeof schema>>

export const defaultValues: Schema = {
  company_name: '',
  primary_color: '#000000',
  owner_name: '',
  email: '',
  password: '',
}
