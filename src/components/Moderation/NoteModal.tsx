'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'components/UI/Dialog'
import { Button } from 'components/UI/Button'
import { Textarea } from 'components/UI/Textarea'

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  userId: number
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, userId }) => {
  const { token } = useAuth()
  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  const [note, setNote] = useState('')

  useEffect(() => {
    if (isOpen) {
      axios.get(`/api/moderation/note/${userId}`, authHeaders).then(res => setNote(res.data?.note || '')).catch(() => {})
    }
  }, [isOpen, userId])

  const save = async () => {
    await axios.post(`/api/moderation/note/${userId}`, { note }, authHeaders).catch(() => {})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle>Note de modération</DialogTitle>
          <DialogDescription className="text-gray-400">Ajouter ou modifier une note concernant ce joueur.</DialogDescription>
        </DialogHeader>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button variant="default" onClick={save}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default NoteModal
