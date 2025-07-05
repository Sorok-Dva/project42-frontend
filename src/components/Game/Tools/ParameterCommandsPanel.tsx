'use client'

import type React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePermissions } from 'hooks/usePermissions'
import type { Socket } from 'socket.io-client'
import CommandModal from './CommandModal'
import { useUser } from 'contexts/UserContext'

interface ParameterCommandsPanelProps {
  socket: Socket | null
  gameId: number
  isVisible: boolean
}

interface ParameterCommand {
  id: string
  label: string
  icon: string
  color: string
  modalType: string
}

const PARAMETER_COMMANDS: ParameterCommand[] = [
  {
    id: 'timer',
    label: 'Gestion Timer',
    icon: '⏰',
    color: 'from-blue-600 to-blue-800',
    modalType: 'timer',
  },
  {
    id: 'stop',
    label: 'Arrêter Phase',
    icon: '⏹️',
    color: 'from-red-600 to-red-800',
    modalType: 'stop',
  },
]

const ParameterCommandsPanel: React.FC<ParameterCommandsPanelProps> = ({ socket, gameId, isVisible }) => {
  const { user } = useUser()
  const { checkPermission } = usePermissions()
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const canUseDev = checkPermission('godPowers', 'addBot')

  if (!canUseDev || !isVisible) return null

  const openModal = (modalType: string) => {
    setActiveModal(modalType)
    setIsExpanded(false)
  }

  const handleCommandSubmit = (params: any) => {
    if (!socket) return

    let commandText = ''

    switch (activeModal) {
    case 'timer':
      commandText = `${params.command} ${params.minutes}`
      break
    case 'stop':
      commandText = `stop ${params.phase}`
      break
    }

    if (commandText) {
      socket.emit('moderationCommand', {
        command: commandText.split(' ')[0],
        arg: commandText.split(' ')[1],
        roomId: gameId,
        playerId: user?.id,
        currentUserRole: user?.role,
        moderator: user,
      })
    }

    setActiveModal(null)
  }

  return (
    <>
      {/* Panel principal */}
      <motion.div
        className="fixed bottom-4 right-24 z-40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-md rounded-xl border border-gray-500/30 shadow-2xl">
          {/* Bouton toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-white transition-colors rounded-xl"
            title="Commandes avec paramètres"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              🎛️
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
                  <span className="text-lg">🎛️</span>
                  <h3 className="text-white font-semibold">Commandes Avancées</h3>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {PARAMETER_COMMANDS.map((command) => (
                    <motion.button
                      key={command.id}
                      onClick={() => openModal(command.modalType)}
                      className={`p-3 rounded-lg bg-gradient-to-r ${command.color} hover:scale-105 transition-all text-white text-sm font-medium flex items-center gap-3`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-lg">{command.icon}</span>
                      <span>{command.label}</span>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-gray-500/30">
                  <p className="text-xs text-gray-400 text-center">
                    Commandes avec paramètres
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Modal de commande */}
      {activeModal && (
        <CommandModal
          isOpen={true}
          roomId={gameId}
          onClose={() => setActiveModal(null)}
          type={activeModal}
          onSubmit={handleCommandSubmit}
        />
      )}
    </>
  )
}

export default ParameterCommandsPanel
