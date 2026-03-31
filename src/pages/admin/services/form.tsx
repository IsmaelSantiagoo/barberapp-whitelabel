import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { CurrencyInput } from '@/components/custom/currency-input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import axios from '@/lib/axios'
import type { ApiResponse } from '@/types/api-response'
import type { Service } from '@/types/consults'

import type { Schema } from './schemas'
import schema, { defaultValues } from './schemas'

interface ServiceFormProps {
  children?: React.ReactNode
  service?: Service
  isDuplicate?: boolean
  onClose: () => void
}

export default function ServiceForm({ children, service, isDuplicate, onClose }: ServiceFormProps) {
  const isEditing = service && !isDuplicate
  const [open, setOpen] = useState(false)
  const [spinners, setSpinners] = useState({
    general: false,
    submiting: false,
  })

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues:
      isDuplicate && service
        ? { ...defaultValues(service), id: null, name: `${service.name} (cópia)` }
        : defaultValues(service),
    mode: 'onSubmit',
  })

  const onSubmit = async (values: Schema) => {
    setSpinners((prev) => ({ ...prev, submiting: true }))

    try {
      const response = await axios[isEditing ? 'put' : 'post']<ApiResponse>(
        `services${isEditing ? `/${service.id}` : ''}`,
        values
      )

      if (response.data.success) {
        toast.success(
          response.data.message ||
            (service ? 'Serviço atualizado com sucesso!' : 'Serviço criado com sucesso!')
        )
        form.reset()
        onClose()
      } else {
        toast.error(
          response.data.message ||
            (service ? 'Erro ao atualizar serviço!' : 'Erro ao criar serviço!')
        )
      }
    } catch (error) {
      console.error(service ? 'Erro ao atualizar serviço:' : 'Erro ao criar serviço:', error)
      toast.error(service ? 'Erro ao atualizar serviço!' : 'Erro ao criar serviço!')
    } finally {
      setSpinners((prev) => ({ ...prev, submiting: false }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <PlusIcon className='mr-2 h-4 w-4' />
            Adicionar Serviço
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isDuplicate ? 'Duplicar Serviço' : isEditing ? 'Editar Serviço' : 'Novo Serviço'}
          </DialogTitle>
          <DialogDescription>
            {isDuplicate
              ? 'Revise os dados e salve a cópia do serviço.'
              : isEditing
                ? 'Atualize as informações do serviço.'
                : 'Preencha os dados do novo serviço.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 py-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormLabel required>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder='Nome' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='duration_minutes'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormLabel required>Duração (minutos)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Duração em minutos'
                        min={1}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === '' ? '' : Number(value))
                        }}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Preço</FormLabel>
                    <FormControl>
                      <CurrencyInput placeholder='R$ 0,00' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='active'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Status</FormLabel>
                    <FormControl>
                      <div className='flex justify-between border border-input rounded-md px-2 p-1.25 bg-input/40'>
                        <span>{field.value ? 'Ativo' : 'Inativo'}</span>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  disabled={spinners.submiting}
                  type='button'
                  variant='outline'
                  className='w-full sm:w-auto'
                  onClick={() => form.reset()}
                >
                  Cancelar
                </Button>
              </DialogClose>

              <Button
                disabled={spinners.submiting}
                type='submit'
                loading={spinners.submiting}
                className='w-full sm:w-auto'
              >
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
