import React, { FC, useState } from 'react'
import ModalContext from './ModalContext'
import ProfileModal from '../components/ProfileModal'

interface ModalProviderProps {
  children: React.ReactNode;
}

const ModalProvider: FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<string>('default')
  const [selectedNickname, setSelectedNickname] = useState<string | null>(null)

  const openModal = (
    type: string,
    params: DOMStringMap,
  ) => {
    setType(type)

    if (params.profile) setSelectedNickname(params.profile as string)

    setIsOpen(true)
  }

  const closeModal = () => {
    setSelectedNickname(null)
    setIsOpen(false)
  }

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {type === 'profile' && isOpen && selectedNickname && (
        <ProfileModal nickname={selectedNickname} onClose={closeModal} />
      )}
    </ModalContext.Provider>
  )
}

export default ModalProvider
