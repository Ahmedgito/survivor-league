import { useState } from 'react'
import { cn } from '@/lib/cn'
import type { Pet } from '@/data/types'
import { PetVisual } from './PetVisual'
import { getPetPhoto } from './petPhotos'

export interface PetPhotoProps {
  pet: Pet
  /** Sizing/shape classes for the frame (e.g. an aspect ratio + width). */
  className?: string
  /** The `sizes` attribute so the browser picks the 800w or 1600w file. */
  sizes: string
  /** Above-the-fold image: eager + high fetch priority. */
  priority?: boolean
  /** Size of the illustrated fallback. */
  fallbackSize?: 'md' | 'lg'
}

/**
 * A real stand-in photo of the pet (4:3 WebP, 800w/1600w). Falls back to the tinted, illustrated
 * PetVisual when there is no photo or the image fails to load.
 */
export function PetPhoto({ pet, className, sizes, priority = false, fallbackSize = 'md' }: PetPhotoProps) {
  const photo = getPetPhoto(pet.id)
  const [failed, setFailed] = useState(false)

  if (!photo || failed) return <PetVisual pet={pet} size={fallbackSize} className={className} />

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ backgroundColor: pet.cardColor }}>
      <img
        src={photo.src800}
        srcSet={`${photo.src800} 800w, ${photo.src1600} 1600w`}
        sizes={sizes}
        width={800}
        height={600}
        alt={photo.alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onError={() => setFailed(true)}
        className="absolute inset-0 size-full object-cover"
      />
    </div>
  )
}

export default PetPhoto
