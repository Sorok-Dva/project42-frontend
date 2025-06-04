'use client'

import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from 'contexts/SocketContext'
import { useUser } from 'contexts/UserContext'

interface GuideChatProps {
  guideRoomName: string
  partnerNickname: string
  amIGuide: boolean
  onSessionTerminated: () => void
}

interface Message {
  senderId?: number
  senderNickname: string
  message: string
  timestamp: string
}

const GuideChat: React.FC<GuideChatProps> = ({ guideRoomName, partnerNickname, amIGuide, onSessionTerminated }) => {
  const { socket } = useSocket()
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTerminated, setIsTerminated] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  const currentUserNickname = user?.nickname || 'Vous'

  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setHasUnreadMessages(false)
    }
  }, [messages, isExpanded])

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message])

      // Si le chat est réduit et que ce n'est pas notre message, marquer comme non lu
      if (!isExpanded && message.senderNickname !== currentUserNickname) {
        setHasUnreadMessages(true)
      }
    }

    const handleSessionTerminated = (data: { guideRoomName: string; reason: string; roomId: number }) => {
      if (data.guideRoomName === guideRoomName) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            senderNickname: 'System',
            message: `Session terminée : ${data.reason}`,
            timestamp: new Date().toISOString(),
          },
        ])
        setIsTerminated(true)
        if (onSessionTerminated) {
          onSessionTerminated()
        }
      }
    }

    socket.on('new_guide_message', handleNewMessage)
    socket.on('guide_session_terminated', handleSessionTerminated)

    return () => {
      socket.off('new_guide_message', handleNewMessage)
      socket.off('guide_session_terminated', handleSessionTerminated)
    }
  }, [socket, guideRoomName, onSessionTerminated, isExpanded, currentUserNickname])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!socket || !newMessage.trim() || isTerminated) return

    socket.emit('send_guide_message', {
      guideRoomName,
      message: newMessage.trim(),
    })
    setNewMessage('')
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      setHasUnreadMessages(false)
    }
  }

  const handleTerminateSession = () => {
    if (socket && confirm('Êtes-vous sûr de vouloir terminer cette session de guide ?')) {
      socket.emit('terminate_guide_session', { guideRoomName })
    }
  }

  return (
    <motion.div
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-96"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      {/* En-tête du chat (toujours visible) */}
      <motion.div
        className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-md rounded-t-xl border border-purple-500/30 cursor-pointer"
        onClick={toggleExpanded}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-semibold text-sm">Guide: {partnerNickname}</span>
            <span className="text-purple-200 text-xs">({amIGuide ? 'Guidant' : 'Guidé'})</span>
            {hasUnreadMessages && (
              <motion.div
                className="w-2 h-2 bg-red-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              className="text-purple-200 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                handleTerminateSession()
              }}
              title="Terminer la session"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            <motion.div
              className="text-purple-200"
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Contenu du chat (rétractable) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="bg-black/80 backdrop-blur-md rounded-b-xl border-x border-b border-purple-500/30 shadow-2xl"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isTerminated && (
              <div className="px-4 py-2 bg-red-900/20 border-b border-red-500/30">
                <p className="text-red-300 text-center text-sm font-medium">Session terminée</p>
              </div>
            )}

            {/* Zone des messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  className={`flex ${msg.senderNickname === currentUserNickname ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      msg.senderNickname === currentUserNickname
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : msg.senderNickname === 'System'
                          ? 'bg-gray-700/50 text-gray-300'
                          : 'bg-gray-800/50 text-gray-100'
                    }`}
                  >
                    <div className="text-xs opacity-75 mb-1">
                      {msg.senderNickname === currentUserNickname ? 'Moi' : msg.senderNickname}
                    </div>
                    <p className="text-sm break-words">{msg.message}</p>
                    <div className="text-xs opacity-60 mt-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie */}
            <div className="p-4 border-t border-purple-500/30">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isTerminated ? 'Session terminée' : 'Écrivez votre message...'}
                  disabled={isTerminated}
                  className="flex-1 bg-gray-800/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent disabled:opacity-50"
                />
                <motion.button
                  type="submit"
                  disabled={isTerminated || !newMessage.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isTerminated || !newMessage.trim() ? 1 : 1.05 }}
                  whileTap={{ scale: isTerminated || !newMessage.trim() ? 1 : 0.95 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default GuideChat
