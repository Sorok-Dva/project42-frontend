'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'components/UI/Dialog'
import { Button } from 'components/UI/Button'

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  userId: number
}

interface HistoryData {
  warnings: { reason: string }[]
  bans: { reason: string }[]
  nickChanges: { oldNickname: string; newNickname: string }[]
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, userId }) => {
  const { token } = useAuth()
  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  const [history, setHistory] = useState<HistoryData>({ warnings: [], bans: [], nickChanges: [] })

  useEffect(() => {
    if (isOpen) {
      axios.get(`/api/moderation/history/${userId}`, authHeaders).then(res => setHistory(res.data)).catch(() => {})
    }
  }, [isOpen, userId])

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle>Antécédents</DialogTitle>
          <DialogDescription className="text-gray-400">Avertissements, bannissements et changements de pseudo.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-auto">
          <div>
            <h4 className="font-medium mb-2">Avertissements</h4>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              {history.warnings.map((w, i) => (
                <li key={i}>{w.reason}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Bannissements</h4>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              {history.bans.map((b, i) => (
                <li key={i}>{b.reason}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Changements de pseudo</h4>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              {history.nickChanges.map((n, i) => (
                <li key={i}>{n.oldNickname} → {n.newNickname}</li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default HistoryModal
