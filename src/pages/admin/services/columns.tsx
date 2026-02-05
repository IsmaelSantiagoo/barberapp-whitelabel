import type { ReactNode } from 'react'

import { PencilIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

import Alert from '@/components/custom/alert-dialog'
import type { ColumnDef } from '@/components/custom/data-grid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import axios from '@/lib/axios'
import { cn } from '@/lib/utils'
import type { ApiResponse } from '@/types/api-response'
import type { Service } from '@/types/consults'
import { formatCurrency } from '@/utils/formatters'

import ServiceForm from './form'

const handleDelete = async (service: Service, reload?: () => void) => {
  try {
    const response = await axios.delete<ApiResponse>(`/services/${service.id}`)

    const { data } = response

    if (data.success) {
      toast.success(data.message || 'Serviço removido!')
    } else {
      toast.error(data.message || 'Erro ao remover serviço!')
    }
  } catch (error) {
    console.error('Error deleting service:', error)
    toast.error('Erro ao remover serviço.')
  } finally {
    if (reload) reload()
  }
}

/**
 * Definição das colunas da tabela de estoque
 */
export const columns = (reload?: () => void): ColumnDef<Service>[] => [
  // Coluna de nome
  {
    id: 'name',
    header: 'Nome',
    accessor: 'name',
    headerAlign: 'left',
    cellAlign: 'left',
    renderCell: (_value, row) => row.name,
  },
  // Coluna de nome
  {
    id: 'price',
    header: 'Preço',
    accessor: 'price',
    headerAlign: 'left',
    cellAlign: 'left',
    renderCell: (_value, row) => formatCurrency(row.price),
  },
  // Coluna de duração
  {
    id: 'duration_minutes',
    header: 'Duração',
    accessor: 'duration_minutes',
    headerAlign: 'left',
    cellAlign: 'left',
    renderCell: (_value, row) =>
      `${row.duration_minutes > 60 ? (row.duration_minutes / 60).toFixed(0) + ' h' : row.duration_minutes + ' min'}`,
  },
  // Coluna de status
  {
    id: 'active',
    header: 'Status',
    accessor: 'active',
    headerAlign: 'left',
    cellAlign: 'left',
    renderCell: (_value, row): ReactNode => (
      <Badge
        variant='outline'
        className={cn({
          'bg-green-500/10 text-green-500': row.active,
          'bg-red-500/10 text-red-500': !row.active,
        })}
      >
        {row.active ? 'Ativo' : 'Inativo'}
      </Badge>
    ),
  },
  // Coluna de ações
  {
    id: 'actions',
    header: 'Ações',
    headerAlign: 'center',
    cellAlign: 'center',
    renderCell: (_value, row): ReactNode => (
      <div className='flex gap-2 justify-center'>
        <ServiceForm service={row} onClose={() => reload && reload()}>
          <Button size='icon' variant='outline'>
            <PencilIcon className='text-yellow-400' />
          </Button>
        </ServiceForm>
        <Alert
          title='Remover serviço?'
          description={`Você realmente deseja remover o serviço ${row.name}? Esta ação não pode ser desfeita.`}
          confirmButton={{
            onClick: () => handleDelete(row, reload),
          }}
        >
          <Button size='icon' variant='outline'>
            <Trash2Icon className='text-red-400' />
          </Button>
        </Alert>
      </div>
    ),
  },
]
