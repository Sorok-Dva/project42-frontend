'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'components/UI/Dialog'
import { Button } from 'components/UI/Button'
import { Input } from 'components/UI/Input'
import { Label } from 'components/UI/Label'

interface RenameModalProps {
  isOpen: boolean
  onClose: () => void
  userId: number
}

const RenameModal: React.FC<RenameModalProps> = ({ isOpen, onClose, userId }) => {
  const { token } = useAuth()
  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  const [nickname, setNickname] = useState('')

  const rename = async () => {
    await axios.post('/api/moderation/rename', { userId, nickname }, authHeaders).catch(() => {})
    onClose()
    setNickname('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle>Renommer le joueur</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nickname" className="text-right">Pseudo</Label>
            <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button variant="default" onClick={rename}>Valider</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RenameModal
