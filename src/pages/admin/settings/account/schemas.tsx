import { z } from 'zod'

import type { User } from '@/types/consults'

const emailSchema = z.object({
  email: z.email('Digite um email válido.').min(1, 'O email é obrigatório.'),
})

const passwordSchema = z
  .object({
    old_pass: z.string().min(1, 'Senha antiga é obrigatória'),
    new_pass: z
      .string()
      .min(8, 'Deve conter no mínimo 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Deve conter letras maiúsculas, minúsculas, números e símbolos'
      ),
    confirm_new_pass: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.old_pass !== data.new_pass, {
    message: 'A nova senha deve ser diferente da senha antiga',
    path: ['new_pass'],
  })
  .refine((data) => data.new_pass === data.confirm_new_pass, {
    message: 'As senhas não coincidem',
    path: ['confirm_new_pass'],
  })

export type PasswordSchema = z.infer<typeof passwordSchema>
export type EmailSchema = z.infer<typeof emailSchema>

export const emailDefaultValues = (user?: User | null): EmailSchema => ({
  email: user?.email || '',
})

export const passwordDefaultValues = (): PasswordSchema => ({
  old_pass: '',
  new_pass: '',
  confirm_new_pass: '',
})

export const password_validations = (
  senha_antiga: string,
  senha_nova: string,
  confirmar_senha_nova: string
) => [
  {
    title: 'min8',
    validation: senha_nova.length >= 8,
    message: 'Conter no mínimo 8 caracteres',
  },
  {
    title: 'match',
    validation:
      senha_nova === confirmar_senha_nova &&
      senha_nova.length > 0 &&
      confirmar_senha_nova.length > 0,
    message: 'Ser confirmada corretamente',
  },
  {
    title: 'sameAsCurrent',
    validation: senha_antiga !== senha_nova && senha_antiga.length > 0 && senha_nova.length > 0,
    message: 'Ser diferente da antiga',
  },
  {
    title: 'invalidPassword',
    validation: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      senha_nova
    ),
    message: 'Conter letras maiúsculas, minúsculas, números e símbolos.',
  },
]

export { passwordSchema, emailSchema }
