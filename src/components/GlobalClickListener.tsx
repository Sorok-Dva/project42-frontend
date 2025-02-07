import { FC, useEffect } from 'react'
import { useProfileModal } from 'contexts/ProfileModalContext'

const GlobalClickListener: FC = () => {
  const { openModal } = useProfileModal()

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      let target = event.target as HTMLElement | null

      // On remonte dans les parents jusqu'à trouver data-profile ou qu'il n'y ait plus de parent
      while (target) {
        if (target.dataset.profile) {
          openModal(target.dataset.profile)
          break
        }
        target = target.parentElement
      }
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [openModal])

  return null // Pas d'affichage; juste un écouteur global
}

export default GlobalClickListener
