import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import PageBanner from 'components/Common/PageBanner'
import ResetPassword from 'components/Auth/ResetPassword'

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('')

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: roomName }),
      })
      if (!response.ok) {
        toast.warn('Une erreur est survenue lors de la création du salon.',
          ToastDefaultOptions)
      } else {
        toast.success('Room created successfully!',
          ToastDefaultOptions)
      }
    } catch (error) {
      console.error('Error creating room:', error)
    }
  }

  return (
    <form onSubmit={ handleCreateRoom }>
      <input
        type="text"
        placeholder="Room name"
        value={ roomName }
        onChange={ (e) => setRoomName(e.target.value) }
      />
      <button type="submit">Create Room</button>
    </form>

  )
}

export default CreateRoom
