import { z } from 'zod'

import detectAppMode, { isClientContext } from '@/lib/detectAppMode'

export const schema = (registering: boolean) =>
  z
    .object({
      company_name: z.string().optional(),
      primary_color: z.string().optional(),
      owner_name: z.string().optional(), // obrigatório apenas no registro
      email: z.string().min(1, 'O email é obrigatório'),
      telefone: z.string().optional(),
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
        // Apenas valida company_name se for contexto admin (sem barbershop_id)
        if (registering && !isClientContext()) {
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
        // Apenas valida primary_color se for contexto admin (sem barbershop_id)
        if (registering && !isClientContext()) {
          return !!data.primary_color && data.primary_color.trim().length > 0
        }
        return true
      },
      {
        message: 'A cor principal é obrigatória',
        path: ['primary_color'],
      }
    )
    .refine((data) => {
      // apenas valida telefone se estiver registrando
      if (registering && detectAppMode() === 'client') {
        return !!data.telefone && data.telefone.trim().length > 0
      }
      return true
    })

export type Schema = z.infer<ReturnType<typeof schema>>

export const defaultValues: Schema = {
  company_name: '',
  primary_color: '#000000',
  owner_name: '',
  email: '',
  telefone: '',
  password: '',
}

// --- Client Auth (Phone + OTP) ---

export const clientPhoneSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  phone: z
    .string()
    .min(10, 'O telefone deve ter pelo menos 10 dígitos')
    .max(11, 'O telefone deve ter no máximo 11 dígitos'),
})

export type ClientPhoneSchema = z.infer<typeof clientPhoneSchema>

export const clientPhoneDefaults: ClientPhoneSchema = {
  name: '',
  phone: '',
}

export const clientOtpSchema = z.object({
  code: z.string().length(6, 'O código deve ter 6 dígitos'),
})

export type ClientOtpSchema = z.infer<typeof clientOtpSchema>
