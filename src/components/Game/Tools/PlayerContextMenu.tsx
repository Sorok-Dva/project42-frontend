'use client'

import React, { useEffect } from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePermissions } from 'hooks/usePermissions'
import type { Socket } from 'socket.io-client'
import KickPlayerModal from '../KickPlayerModal'
import CommandModal from './CommandModal'
import ThrowItemModal from '../ThrowItemModal'
import { createPortal } from 'react-dom'
import { useUser } from 'contexts/UserContext'

interface PlayerContextMenuProps {
  isOpen: boolean
  onClose: () => void
  playerName: string
  playerId: number
  position: { x: number; y: number }
  socket: Socket | null
  gameId: string
  isCreator: boolean
}

interface PlayerCommand {
  id: string
  label: string
  icon: string
  color: string
  command: string
  requiresModal?: boolean
  modalType?: string
  devOnly?: boolean
  allowed: boolean
}

const PlayerContextMenu: React.FC<PlayerContextMenuProps> = ({
  isOpen,
  onClose,
  playerName,
  playerId,
  position,
  socket,
  gameId,
  isCreator,
}) => {
  const { user } = useUser()
  const { checkPermission } = usePermissions()
  const [kickModalOpen, setKickModalOpen] = useState(false)
  const [commandModal, setCommandModal] = useState<{ type: string; command: string } | null>(null)
  const [throwItemModalOpen, setThrowItemModalOpen] = useState(false)
  const [mounted, setMounted] = useState<boolean>(false)

  const premiumDate = user?.premium ? new Date(user.premium) : null
  const isPremium = premiumDate ? Date.now() < premiumDate.getTime() : false

  const canUseDev = checkPermission('godPowers', 'addBot')

  const PLAYER_COMMANDS: PlayerCommand[] = [
    {
      id: 'crea',
      label: 'Transférer créateur',
      icon: '👑',
      color: 'text-yellow-400',
      command: 'crea',
      devOnly: false,
      allowed: checkPermission('gamePowers', 'crea')
    },
    {
      id: 'kick',
      label: 'Expulser',
      icon: '🚪',
      color: 'text-red-400',
      command: 'kick',
      requiresModal: true,
      modalType: 'kick',
      allowed: checkPermission('gamePowers', 'kick')
    },
    {
      id: 'kill',
      label: 'Tuer',
      icon: '💀',
      color: 'text-red-500',
      command: 'kill',
      devOnly: true,
      allowed: checkPermission('gamePowers', 'kill')
    },
    {
      id: 'revive',
      label: 'Ressusciter',
      icon: '👼',
      color: 'text-yellow-500',
      command: 'revive',
      devOnly: true,
      allowed: checkPermission('gamePowers', 'revive')
    },
    {
      id: 'mp',
      label: 'Message privé',
      icon: '💬',
      color: 'text-blue-400',
      command: 'mp',
      requiresModal: true,
      modalType: 'message',
      devOnly: false,
      allowed: checkPermission('gamePowers', 'mp')
    },
    {
      id: 'mute',
      label: 'Mute',
      icon: '🔇',
      color: 'text-orange-400',
      command: 'mute',
      requiresModal: true,
      modalType: 'mute',
      devOnly: false,
      allowed: checkPermission('gamePowers', 'mute')
    },
    {
      id: 'unmute',
      label: 'Démute',
      icon: '🔊',
      color: 'text-green-400',
      command: 'unmute',
      devOnly: false,
      allowed: checkPermission('gamePowers', 'unmute')
    },
    {
      id: 'player',
      label: 'Infos joueur',
      icon: 'ℹ️',
      color: 'text-cyan-400',
      command: 'player',
      devOnly: false,
      allowed: checkPermission('gamePowers', 'player')
    },
    {
      id: 'card',
      label: 'Assigner carte',
      icon: '🃏',
      color: 'text-purple-400',
      command: 'card',
      requiresModal: true,
      modalType: 'card',
      devOnly: true,
      allowed: checkPermission('gamePowers', 'card')
    },
    {
      id: 'throwItem',
      label: 'Lancer un objet',
      icon: '🍅',
      color: 'text-orange-400',
      command: 'throwItem',
      requiresModal: true,
      modalType: 'throwItem',
      devOnly: false,
      allowed: isPremium,
    },
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  const executeCommand = (command: PlayerCommand) => {
    if (command.requiresModal) {
      if (command.modalType === 'kick') {
        setKickModalOpen(true)
      } else if (command.modalType === 'throwItem') {
        setThrowItemModalOpen(true)
      } else {
        setCommandModal({ type: command.modalType!, command: command.command })
      }
    } else {
      sendCommand(`${command.command} ${playerName}`)
      onClose()
    }
  }

  const sendCommand = (commandText: string) => {
    if (!socket) return

    socket.emit('moderationCommand', {
      command: commandText.split(' ')[0],
      arg: commandText.split(' ')[1],
      text: commandText.split(commandText.split(' ')[1])[1].trim(),
      roomId: gameId,
      playerId: user?.id,
      currentUserRole: user?.role,
      moderator: user,
    })
  }

  const handleKickConfirm = async (reason: string, isPermanent: boolean) => {
    sendCommand(`kick ${playerName} ${reason}`)
  }

  const handleKickCancel = () => {
    setKickModalOpen(false)
    onClose() // Fermer le menu si annulation
  }

  const handleThrowItemSelect = (itemId: number) => {
    if (socket) {
      socket.emit('throwItem', { roomId: gameId, itemId, targetId: playerId })
    }
    setThrowItemModalOpen(false)
    onClose()
  }

  const handleCommandSubmit = (params: any) => {
    if (!commandModal) return

    let commandText = `${commandModal.command} ${playerName}`

    switch (commandModal.type) {
    case 'message':
      commandText += ` ${params.message}`
      break
    case 'mute':
      commandText += ` ${params.reason}`
      break
    case 'card':
      commandText += ` ${params.cardId}`
      break
    }

    sendCommand(commandText)
    setCommandModal(null)
    onClose()
  }

  const handleCommandCancel = () => {
    setCommandModal(null)
    onClose() // Fermer le menu si annulation
  }

  const availableCommands = PLAYER_COMMANDS.filter(cmd => {
    if (!cmd.allowed) return false
    if (cmd.devOnly && !canUseDev) return false
    if (cmd.id === 'kick' && !isCreator && !canUseDev) return false
    return true
  })

  if (!isOpen || availableCommands.length === 0 || !mounted) return null

  const menuHeight = availableCommands.length * 40 + 120
  const menuWidth = 220

  // Calculer la position pour éviter que le menu sorte de l'écran
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - menuWidth),
    y: Math.min(position.y, window.innerHeight - menuHeight),
  }

  // Fermer le menu si on clique sur l'overlay, mais seulement si aucune modal n'est ouverte
  const handleOverlayClick = () => {
    if (!kickModalOpen && !commandModal && !throwItemModalOpen) {
      onClose()
    }
  }

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-30" onClick={handleOverlayClick} />

          {/* Menu contextuel */}
          <motion.div
            className="fixed z-40 bg-gradient-to-r from-black/90 to-gray-900/90 backdrop-blur-md rounded-xl border border-gray-500/30 shadow-2xl min-w-[200px]"
            style={{
              left: adjustedPosition.x,
              top: adjustedPosition.y,
            }}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* En-tête */}
            <div className="px-4 py-3 border-b border-gray-500/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="font-bold text-sm">{playerName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">{playerName}</h4>
                  <p className="text-xs text-gray-400">Actions disponibles</p>
                </div>
              </div>
            </div>

            {/* Liste des commandes */}
            <div className="py-2">
              {availableCommands.map((command) => (
                <motion.button
                  key={command.id}
                  onClick={() => executeCommand(command)}
                  className="w-full px-4 py-2 text-left hover:bg-black/40 transition-colors flex items-center gap-3"
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                >
                  <span className="text-lg">{command.icon}</span>
                  <span className={`${command.color} font-medium`}>{command.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-500/30">
              <p className="text-xs text-gray-500 text-center">
                {canUseDev ? 'Mode développeur actif' : 'Actions modérateur'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <>
      {/* Rendu du menu dans un portail */}
      {typeof window !== 'undefined' && createPortal(menuContent, document.body)}

      {createPortal(
        <>
          {/* Modals */}
          <KickPlayerModal
            isOpen={kickModalOpen}
            onClose={handleKickCancel}
            playerName={playerName}
            onConfirm={handleKickConfirm}
          />

          {commandModal && (
            <CommandModal
              isOpen={true}
              roomId={Number(gameId)}
              onClose={handleCommandCancel}
              type={commandModal.type}
              playerName={playerName}
              onSubmit={handleCommandSubmit}
            />
          )}

          <ThrowItemModal
            isOpen={throwItemModalOpen}
            onClose={() => setThrowItemModalOpen(false)}
            onSelect={handleThrowItemSelect}
          />
        </>, document.body)}
    </>
  )
}

export default PlayerContextMenu
