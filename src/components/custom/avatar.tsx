import { UserCircle2Icon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface CustomAvatarProps {
  src?: string | null
  alt?: string
  className?: string
}
export function CustomAvatar({ src, alt, className }: CustomAvatarProps) {
  return (
    <Avatar>
      <AvatarImage
        src={src || ''}
        alt={alt || 'Profile Picture'}
        className={`grayscale ${className}`}
      />
      <AvatarFallback>
        {alt ? (
          alt
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
        ) : (
          <UserCircle2Icon />
        )}
      </AvatarFallback>
    </Avatar>
  )
}
