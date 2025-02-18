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
  const [roomId, setRoomId] = useState<number | null>(0)
  const [slots, setSlots] = useState<number | null>(6)

  const openModal = (
    type: string,
    params: DOMStringMap,
  ) => {
    setType(type)

    if (params.profile) setSelectedNickname(params.profile as string)
    if (params.roomid) setRoomId(Number(params.roomid))
    if (params.slots) setSlots(Number(params.slots))

    setIsOpen(true)
  }

  const closeModal = () => {
    setSelectedNickname(null)
    setRoomId(null)
    setSlots(null)
    setIsOpen(false)
  }

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {type === 'profile' && isOpen && selectedNickname && (
        <ProfileModal nickname={selectedNickname} onClose={closeModal} />
      )}

      {type === 'compo' && slots && roomId && isOpen && (
        <EditComposition slots={slots} roomId={roomId} onClose={closeModal} />
      )}
    </ModalContext.Provider>
  )
}

export default ModalProvider
