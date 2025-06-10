'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'components/UI/Dialog'
import { Button } from 'components/UI/Button'
import { Input } from 'components/UI/Input'
import { Textarea } from 'components/UI/Textarea'
import { Label } from 'components/UI/Label'

interface BanModalProps {
  isOpen: boolean
  onClose: () => void
  targetUser: {
    id: number
    nickname: string
  }
}

const BanModal: React.FC<BanModalProps> = ({ isOpen, onClose, targetUser }) => {
  const { token } = useAuth()
  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState(24)
  const [comment, setComment] = useState('')

  const handleBan = async () => {
    await axios.post('/api/moderation/ban', {
      userId: targetUser.id,
      reason,
      duration,
      comment,
    }, authHeaders).catch(() => {})
    onClose()
    setReason('')
    setComment('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle>Bannir {targetUser.nickname}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="banReason" className="text-right">Raison</Label>
            <Input id="banReason" value={reason} onChange={(e) => setReason(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="banDuration" className="text-right">Durée (heures)</Label>
            <Input id="banDuration" type="number" value={duration} onChange={(e) => setDuration(Number.parseInt(e.target.value))} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="banComment" className="text-right">Commentaire</Label>
            <Textarea id="banComment" value={comment} onChange={(e) => setComment(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button variant="destructive" onClick={handleBan}>Bannir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BanModal
