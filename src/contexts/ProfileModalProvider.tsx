import React, { FC, useState } from 'react'
import ProfileModalContext from './ProfileModalContext'
import ProfileModal from '../components/ProfileModal'

interface ProfileModalProviderProps {
  children: React.ReactNode;
}

const ProfileModalProvider: FC<ProfileModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedNickname, setSelectedNickname] = useState<string | null>(null)

  const openModal = (nickname: string) => {
    setSelectedNickname(nickname)
    setIsOpen(true)
  }

  const closeModal = () => {
    setSelectedNickname(null)
    setIsOpen(false)
  }

  return (
    <ProfileModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {isOpen && selectedNickname && (
        <ProfileModal nickname={selectedNickname} onClose={closeModal} />
      )}
    </ProfileModalContext.Provider>
  )
}

export default ProfileModalProvider
