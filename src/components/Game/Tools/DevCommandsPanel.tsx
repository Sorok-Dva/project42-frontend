'use client'

import type React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePermissions } from 'hooks/usePermissions'
import type { Socket } from 'socket.io-client'
import { useUser } from 'contexts/UserContext'

interface DevCommandsPanelProps {
  socket: Socket | null
  gameId: string
  isVisible: boolean
}

interface Command {
  id: string
  label: string
  command: string
  icon: string
  color: string
  requiresConfirmation?: boolean
  confirmMessage?: string
}

const QUICK_COMMANDS: Command[] = [
  {
    id: 'startPhase',
    label: 'Démarrer Phase',
    command: 'startPhase',
    icon: '▶️',
    color: 'from-green-600 to-green-800',
  },
  {
    id: 'endPhase',
    label: 'Terminer Phase',
    command: 'endPhase',
    icon: '⏹️',
    color: 'from-red-600 to-red-800',
  },
  {
    id: 'setNight',
    label: 'Mode Nuit',
    command: 'setNight',
    icon: '🌙',
    color: 'from-purple-600 to-purple-800',
  },
  {
    id: 'dissolve',
    label: 'Dissoudre',
    command: 'dissolve',
    icon: '💥',
    color: 'from-red-700 to-red-900',
    requiresConfirmation: true,
    confirmMessage: 'Êtes-vous sûr de vouloir dissoudre la partie ? Cette action est irréversible.',
  },
  {
    id: 'forceReload',
    label: 'Recharger',
    command: 'forceReload',
    icon: '🔄',
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 'listCards',
    label: 'Liste Cartes',
    command: 'listCards',
    icon: '🃏',
    color: 'from-yellow-600 to-yellow-800',
  },
]

const DevCommandsPanel: React.FC<DevCommandsPanelProps> = ({ socket, gameId, isVisible }) => {
  const { user } = useUser()
  const { checkPermission } = usePermissions()
  const [isExpanded, setIsExpanded] = useState(false)
  const [confirmCommand, setConfirmCommand] = useState<Command | null>(null)

  const canUseDev = true

  if (!canUseDev || !isVisible) return null

  const executeCommand = (command: Command) => {
    if (command.requiresConfirmation) {
      setConfirmCommand(command)
      return
    }

    sendCommand(command.command)
  }

  const sendCommand = (commandText: string) => {
    if (!socket) return

    socket.emit('developerCommand', {
      command: commandText,
      roomId: gameId,
      playerId: user?.id,
      currentUserRole: user?.role,
      moderator: user,
    })
  }

  const confirmExecution = () => {
    if (confirmCommand) {
      sendCommand(confirmCommand.command)
      setConfirmCommand(null)
    }
  }

  return (
    <>
      {/* Panel principal */}
      <motion.div
        className="fixed bottom-4 right-4 z-40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-md rounded-xl border border-gray-500/30 shadow-2xl">
          {/* Bouton toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-white transition-colors rounded-xl"
            title="Commandes développeur"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ⚙️
            </motion.div>
          </button>

          {/* Panel étendu */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="absolute bottom-14 right-0 bg-gradient-to-r from-black/90 to-gray-900/90 backdrop-blur-md rounded-xl border border-gray-500/30 p-4 min-w-[280px]"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-500/30">
                  <span className="text-lg">⚡</span>
                  <h3 className="text-white font-semibold">Commandes Dev</h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {QUICK_COMMANDS.map((command) => (
                    <motion.button
                      key={command.id}
                      onClick={() => executeCommand(command)}
                      className={`p-3 rounded-lg bg-gradient-to-r ${command.color} hover:scale-105 transition-all text-white text-sm font-medium flex flex-col items-center gap-1`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-lg">{command.icon}</span>
                      <span className="text-xs text-center leading-tight">{command.label}</span>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-gray-500/30">
                  <p className="text-xs text-gray-400 text-center">
                    Commandes rapides pour développeurs
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Modal de confirmation */}
      <AnimatePresence>
        {confirmCommand && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmCommand(null)}
          >
            <motion.div
              className="bg-gradient-to-r from-black/90 to-red-900/40 backdrop-blur-md rounded-xl border border-red-500/30 p-6 max-w-md w-full mx-4 shadow-2xl"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">{confirmCommand.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Confirmation requise</h3>
                  <p className="text-red-200 text-sm">Action de développeur</p>
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-lg border border-red-500/20 mb-6">
                <p className="text-white">{confirmCommand.confirmMessage}</p>
                <p className="text-red-300 text-sm mt-2">
                  Commande: <code className="bg-black/40 px-2 py-1 rounded">{confirmCommand.command}</code>
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmCommand(null)}
                  className="px-4 py-2 bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white border border-gray-500/30 rounded-lg transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmExecution}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white rounded-lg transition-all"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default DevCommandsPanel
