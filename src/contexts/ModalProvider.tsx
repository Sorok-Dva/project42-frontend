import React, { FC, useState } from 'react'
import ModalContext from './ModalContext'
import ProfileModal from '../components/ProfileModal'
import EditComposition from 'components/Game/EditComposition'

interface ModalProviderProps {
  children: React.ReactNode;
}

const ModalProvider: FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<string>('default')
  const [selectedNickname, setSelectedNickname] = useState<string | null>(null)

  const openModal = (
    type: string,
    nickname: unknown,
  ) => {
    setSelectedNickname(nickname as string)
    setType(type)
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

      {type === 'compo' && isOpen && (
        <EditComposition onClose={closeModal} />
      )}
    </ModalContext.Provider>
  )
}

export default ModalProvider
