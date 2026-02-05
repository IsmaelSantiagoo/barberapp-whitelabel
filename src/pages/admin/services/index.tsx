import { useEffect, useState } from 'react'

import { ScissorsIcon } from 'lucide-react'
import { toast } from 'sonner'

import { DataGrid, type FilterState, type SortState } from '@/components/custom/data-grid'
import Loader from '@/components/custom/loader'
import { Card, CardContent } from '@/components/ui/card'
import axios from '@/lib/axios'
import type { ApiResponse } from '@/types/api-response'
import type { Service } from '@/types/consults'

import { columns } from './columns'
import ServiceForm from './form'

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([])
  const [spinners, setSpinners] = useState({
    general: true,
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    setSpinners((prev) => ({ ...prev, general: true }))

    try {
      const response = await axios.get<ApiResponse<Service[]>>('/services')

      if (response.data.success) {
        setServices(response.data.data)
      } else {
        toast.error(response.data.message || 'Erro ao buscar serviçoes.')
      }
    } catch (error: any) {
      toast.error('Erro ao buscar serviços.', error)
    } finally {
      setSpinners((prev) => ({ ...prev, general: false, refresh: false }))
    }
  }

  // ==================== States do DataGrid ====================
  const [sorting, setSorting] = useState<SortState[]>([])
  const [gridFilters, setGridFilters] = useState<FilterState[]>([])

  // ==================== States de Dados ====================
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set())

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold hidden lg:block'>Serviços</h1>
          <p className='text-muted-foreground'>{services.length} serviço(s) cadastrado(s)</p>
        </div>
        <ServiceForm
          onClose={() => {
            fetchServices()
          }}
        />
      </div>

      {spinners.general ? (
        <div className='py-8'>
          <Loader showMessage={true} message='Carregando serviços...' />
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className='text-center'>
            <ScissorsIcon className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
            <h3 className='font-semibold mb-2'>Nenhum serviço cadastrado</h3>
            <p className='text-muted-foreground mb-4'>Comece adicionando seu primeiro serviço.</p>
            <ServiceForm
              onClose={() => {
                fetchServices()
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-3'>
          <DataGrid
            columns={columns(fetchServices)}
            data={services}
            getRowId={(row) => row.id}
            // Estado de loading
            isLoading={spinners.general}
            emptyMessage='Nenhum serviço encontrado.'
            // Ordenação
            sorting={sorting}
            onSortingChange={setSorting}
            enableMultiSort={true}
            // Filtragem inline (client-side)
            filters={gridFilters}
            onFiltersChange={setGridFilters}
            // Seleção de linhas
            enableSelection
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            // Estilização
            height='100%'
            emptyValuePlaceholder='-'
          />
        </div>
      )}
    </div>
  )
}
