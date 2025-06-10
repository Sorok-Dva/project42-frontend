'use client'

import React from 'react'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'components/UI/Dialog'
import { Button } from 'components/UI/Button'

interface RemoveAvatarModalProps {
  isOpen: boolean
  onClose: () => void
  userId: number
}

const RemoveAvatarModal: React.FC<RemoveAvatarModalProps> = ({ isOpen, onClose, userId }) => {
  const { token } = useAuth()
  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {}

  const handleRemove = async () => {
    await axios.post('/api/moderation/remove-avatar', { userId }, authHeaders).catch(() => {})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[400px] bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle>Supprimer l'avatar ?</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button variant="destructive" onClick={handleRemove}>Confirmer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RemoveAvatarModal
