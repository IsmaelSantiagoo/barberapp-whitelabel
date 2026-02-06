import { z } from 'zod'

import type { BarberShop } from '@/types/consults'

const schema = z.object({
  company_name: z.string().min(1, 'O nome da empresa é obrigatório.'),
  phone: z.string().max(15, 'O telefone deve ter no máximo 15 caracteres.').optional(),
  address: z.string().optional(),
  instagram: z.string().optional(),
  logo_url: z.string().optional(),
  app_link: z.string().optional(),
  primary_color: z
    .string()
    .min(7, 'A cor primária é obrigatória.')
    .max(7, 'A cor primária é obrigatória.'),
})

export type Schema = z.infer<typeof schema>

export const defaultValues = (data?: BarberShop | null): Schema => ({
  company_name: data?.company_name || '',
  phone: data?.phone || '',
  address: data?.address || '',
  instagram: data?.instagram || '',
  logo_url: data?.logo_url || '',
  app_link: data?.app_link || '',
  primary_color: data?.primary_color || '#000000',
})

export default schema
