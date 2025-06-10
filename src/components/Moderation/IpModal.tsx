'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'components/UI/Dialog'
import { Button } from 'components/UI/Button'

interface IpModalProps {
  isOpen: boolean
  onClose: () => void
  userId: number
}

interface Ips { registerIp: string; lastLoginIp: string }

const IpModal: React.FC<IpModalProps> = ({ isOpen, onClose, userId }) => {
  const { token } = useAuth()
  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  const [ips, setIps] = useState<Ips | null>(null)

  useEffect(() => {
    if (isOpen) {
      axios.get(`/api/moderation/ips/${userId}`, authHeaders).then(res => setIps(res.data)).catch(() => {})
    }
  }, [isOpen, userId])

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[400px] bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle>Adresses IP</DialogTitle>
        </DialogHeader>
        {ips && (
          <div className="space-y-2 text-sm">
            <p>IP d'inscription : <span className="font-medium">{ips.registerIp}</span></p>
            <p>Dernière IP : <span className="font-medium">{ips.lastLoginIp}</span></p>
          </div>
        )}
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default IpModal
