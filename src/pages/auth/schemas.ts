import { z } from 'zod'

export const schema = z.object({
  nome: z.string(), // obrigatório apenas no registro
  email: z.string().min(1, 'O email é obrigatório'),
  senha: z.string().min(1, 'A senha é obrigatória'),
})

export type Schema = z.infer<typeof schema>

export const defaultValues: Schema = {
  nome: '',
  email: '',
  senha: '',
}
