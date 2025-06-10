'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'components/UI/Dialog'
import { Button } from 'components/UI/Button'
import { Input } from 'components/UI/Input'

interface WarnModalProps {
  isOpen: boolean
  onClose: () => void
  targetUser: {
    id: number
    nickname: string
  }
}

const WarnModal: React.FC<WarnModalProps> = ({ isOpen, onClose, targetUser }) => {
  const { token } = useAuth()
  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  const [reason, setReason] = useState('')

  const handleWarn = async () => {
    await axios.post('/api/moderation/warn', { userId: targetUser.id, reason }, authHeaders).catch(() => {})
    onClose()
    setReason('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle>Avertir {targetUser.nickname}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input placeholder="Raison" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button variant="destructive" onClick={handleWarn}>Avertir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default WarnModal
