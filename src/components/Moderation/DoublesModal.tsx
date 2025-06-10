'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'components/UI/Dialog'
import { Button } from 'components/UI/Button'

interface DoublesModalProps {
  isOpen: boolean
  onClose: () => void
  userId: number
}

interface DoubleUser { id: number; nickname: string }

const DoublesModal: React.FC<DoublesModalProps> = ({ isOpen, onClose, userId }) => {
  const { token } = useAuth()
  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  const [doubles, setDoubles] = useState<DoubleUser[]>([])

  useEffect(() => {
    if (isOpen) {
      axios.get(`/api/moderation/doubles/${userId}`, authHeaders).then(res => setDoubles(res.data)).catch(() => {})
    }
  }, [isOpen, userId])

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[400px] bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle>Doubles comptes</DialogTitle>
          <DialogDescription className="text-gray-400">Joueurs partageant la même IP.</DialogDescription>
        </DialogHeader>
        <ul className="list-disc ml-5 space-y-1 text-sm max-h-[50vh] overflow-auto">
          {doubles.map((d) => (
            <li key={d.id}>{d.nickname}</li>
          ))}
        </ul>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DoublesModal
