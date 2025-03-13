import { useEffect, useRef, useState } from 'react'

const useDropdown = () => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  const handleClick = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setOpen(false)
    }
  }
  const handleEscapeKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setOpen(false)
    }
  }
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      handleClick(event)
    }

    document.addEventListener('click', handleGlobalClick)
    document.addEventListener('keydown', handleEscapeKeyPress)
    return () => {
      document.removeEventListener('click', handleGlobalClick)
      document.removeEventListener('keydown', handleEscapeKeyPress)
    }
  }, []) // Empty dependency array to run only once when the component mounts

  const toggleOpen = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  return { open, toggleOpen, ref }
}

export default useDropdown
