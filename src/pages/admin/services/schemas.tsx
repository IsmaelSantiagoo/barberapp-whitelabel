import { z } from 'zod'

import type { Service } from '@/types/consults'

const schema = z.object({
  id: z.number().nullable(),
  name: z.string().min(1, 'O nome é obrigatório.'),
  price: z.number().min(0, 'O valor deve ser maior ou igual a zero.'),
  duration_minutes: z
    .union([z.literal(''), z.number()])
    .refine((val) => val !== '' && val >= 1, { message: 'A duração deve ser maior que zero.' }),
  active: z.boolean(),
})

export type Schema = z.infer<typeof schema>

export const defaultValues = (data?: Service): Schema => ({
  id: data?.id || null,
  name: data?.name || '',
  price: Number(data?.price) || 0,
  duration_minutes: data?.duration_minutes ?? '',
  active: data?.active ?? true,
})

export default schema
