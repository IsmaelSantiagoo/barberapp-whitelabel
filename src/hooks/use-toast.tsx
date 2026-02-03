import { toast } from 'sonner'

export function useToast() {
  return {
    toast: (options: {
      title: string
      description?: string
      variant?: 'destructive' | 'default'
    }) => {
      if (options.variant === 'destructive') {
        toast.error(options.title, {
          description: options.description,
        })
      } else {
        toast.success(options.title, {
          description: options.description,
        })
      }
    },
  }
}
