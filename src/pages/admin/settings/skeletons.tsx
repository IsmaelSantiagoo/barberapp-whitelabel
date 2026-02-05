import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function PageSkeleton() {
  return (
    <div className='min-w-2xl mx-auto space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-col gap-3'>
          <Skeleton className='p-2 w-22' />
          <Skeleton className='p-2 w-md' />
        </div>
        <Skeleton className='h-8 w-22' />
      </div>

      <div className='space-y-6'>
        {/* App Link */}
        <Card>
          <CardHeader>
            <Skeleton className='p-2 w-22' />
            <Skeleton className='p-2 w-md' />
          </CardHeader>
          <CardContent>
            <div className='flex gap-2'>
              <Skeleton className='p-2 w-full' />
              <Skeleton className='h-8 w-22' />
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <Skeleton className='p-2 w-22' />
          </CardHeader>
          <CardContent className='space-y-4'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className='space-y-2'>
                <Skeleton className='p-2 w-32' />
                <Skeleton className='h-8 p-2 w-full' />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Whitelabel */}
        <Card>
          <CardHeader>
            <Skeleton className='p-2 w-22' />
            <Skeleton className='p-2 w-md' />
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Skeleton className='p-2 w-22' />
              <Skeleton className='h-8 p-2 w-full' />
              <Skeleton className='p-2 w-full' />
            </div>

            <div className='space-y-2'>
              <Skeleton className='p-2 w-22' />
              <div className='flex gap-3'>
                <Skeleton className='h-8 p-2 w-22' />
                <Skeleton className='h-8 p-2 w-full' />
              </div>
            </div>

            {/* Preview */}
            <div className='mt-4 p-4 rounded-lg border flex flex-col gap-2'>
              <Skeleton className='p-2 w-22' />
              <div className='flex items-center gap-3'>
                <Skeleton className='h-8 p-2 w-8' />
                <Skeleton className='p-2 w-full' />
              </div>
              <Skeleton className='h-8 p-2 w-full' />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
