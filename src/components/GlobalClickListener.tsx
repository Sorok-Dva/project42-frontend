import { FC, useEffect } from 'react'
import { useModal } from 'contexts/ModalContext'

const GlobalClickListener: FC = () => {
  const { openModal } = useModal()

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      let target = event.target as HTMLElement | null

      while (target) {
        if (target.dataset.profile) {
          openModal('profile', target.dataset)
          break
        }
        if (target.dataset.action) {
          openModal(target.dataset.action, target.dataset)
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

  return null
}

export default GlobalClickListener
