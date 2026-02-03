import { LoaderCircleIcon } from 'lucide-react'

interface LoaderProps {
  showMessage?: boolean
  message?: string
}

export default function Loader(props: LoaderProps) {
  return (
    <div className='w-full flex'>
      <div className='flex flex-col items-center justify-center mx-auto'>
        <LoaderCircleIcon className='animate-spin' />
        {props.showMessage && <p>{props.message || 'Carregando...'}</p>}
      </div>
    </div>
  )
}
