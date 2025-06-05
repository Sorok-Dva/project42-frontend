'use client'

import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameContext } from 'contexts/GameContext' // Updated import
import { Message as MessageType } from 'hooks/useGame' // Assuming Message type is exported from useGame

// Removed GuideChatProps as most props will come from context

const GuideChat: React.FC = () => {
  const {
    player, // Current user
    guideMessages,
    sendGuideMessage,
    terminateGuideSession,
    currentGuide, // Who is guiding the current player
    currentlyGuidedPlayer, // Who the current player is guiding
    messages: allMessages, // Main chat messages from context
  } = useGameContext()

  const [newMessage, setNewMessage] = useState('')
  const [isExpanded, setIsExpanded] = useState(true)
  // const [hasUnreadMessages, setHasUnreadMessages] = useState(false) // Can be derived or handled differently
  // Dragging state remains local
  const [isDragging, setIsDragging] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const amIGuide = !!currentlyGuidedPlayer
  const partner = amIGuide ? currentlyGuidedPlayer : currentGuide
  const isSessionActive = !!partner

  // Scroll to bottom when new messages arrive or chat expands
  useEffect(() => {
    if (isExpanded && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [guideMessages, isExpanded, currentlyGuidedPlayer]) // Added currentlyGuidedPlayer dependency


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !isSessionActive) return
    sendGuideMessage(newMessage.trim())
    setNewMessage('')
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
    // if (!isExpanded) {
    //   setHasUnreadMessages(false) // Reset unread messages when collapsing
    // }
  }

  const handleTerminateSession = () => {
    if (confirm('Êtes-vous sûr de vouloir terminer cette session de guide ?')) {
      terminateGuideSession()
    }
  }

  // If no active session, don't render the chat
  if (!isSessionActive || !player) { // Added !player check for safety
    return null
  }

  // Combine and sort messages if the current user is the guide
  const combinedMessages = (() => {
    let filteredPlayerMessages: MessageType[] = []
    if (amIGuide && currentlyGuidedPlayer && allMessages) {
      filteredPlayerMessages = allMessages.filter(
        (msg) =>
          // Messages sent by the guided player in public channels (e.g., channel 0 or 1)
          (msg.playerId === parseInt(currentlyGuidedPlayer.playerId) && (msg.channel === 0 || msg.channel === 1)) ||
          // Direct messages to the guided player
          (msg.toPlayer === parseInt(currentlyGuidedPlayer.playerId)) ||
          // Direct messages from the guided player to someone else (still relevant for context)
           (msg.playerId === parseInt(currentlyGuidedPlayer.playerId) && msg.toPlayer)
      ).map(msg => ({ ...msg, source: 'playerChat' as const })) // Tag player chat messages
    }

    // Tag guide messages
    const taggedGuideMessages = guideMessages.map(msg => ({ ...msg, source: 'guideChat' as const }))

    if (amIGuide) {
      return [...taggedGuideMessages, ...filteredPlayerMessages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    }
    return taggedGuideMessages // For the guided player, only show guide chat
  })()

  // Drag constraints might need adjustment if window is not defined globally at module execution in some SSR contexts.
  // For client-side only components, this should be fine.
  // Consider moving dragConstraints inside useEffect or make them stateful if window size changes need to be handled dynamically.
  const dragConstraints = {
    top: -20,
    left: typeof window !== 'undefined' ? -window.innerWidth / 2 + 100 : -200, // Adjusted for potential centering issues
    right: typeof window !== 'undefined' ? window.innerWidth / 2 - 300 : 200, // Adjusted for w-96 (384px)
    bottom: typeof window !== 'undefined' ? window.innerHeight - 200 : 400,
  }
  return (
    <motion.div
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-96" // Ensure w-96 is appropriate
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={dragConstraints}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      whileDrag={{ scale: isDragging ? 1.05 : 1, cursor: 'grabbing' }} // Apply scale only when dragging
    >
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-md rounded-t-xl border border-purple-500/30 cursor-pointer"
        onClick={toggleExpanded}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 ${isSessionActive ? 'bg-green-400' : 'bg-red-400'} rounded-full animate-pulse`}></div>
            <span className="text-white font-semibold text-sm">
              {amIGuide ? 'Guidant' : 'Guidé par'}: {partner?.nickname || 'Partenaire'}
            </span>
            {/* {hasUnreadMessages && !isExpanded && (
              <motion.div
                className="w-2 h-2 bg-red-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )} */}
          </div>
          <div className="flex items-center gap-2">
            {isSessionActive && (
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
            )}
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

      {/* Chat Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="bg-black/80 backdrop-blur-md rounded-b-xl border-x border-b border-purple-500/30 shadow-2xl overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 space-y-2 h-64 overflow-y-auto">
              {combinedMessages.map((msg, index) => {
                const isMyMessage = msg.playerId === player?.playerId
                // Default style for guide chat
                let messageStyle = isMyMessage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200'
                let sourceIndicator = msg.source === 'playerChat' ? '(Joueur) ' : ''

                // If it's from playerChat and I am the guide
                if (msg.source === 'playerChat' && amIGuide) {
                  // If the message is from the guided player (not from me, the guide)
                  if (msg.playerId === parseInt(currentlyGuidedPlayer!.playerId)) {
                     messageStyle = 'bg-teal-700 text-white' // Guided player's own messages in their main chat
                  } else if (msg.toPlayer === parseInt(currentlyGuidedPlayer!.playerId)) {
                     messageStyle = 'bg-purple-700 text-white' // Message to the guided player from someone else
                  } else {
                    // Fallback for other player chat messages if any (e.g. guided player sent to someone else)
                    messageStyle = 'bg-gray-600 text-gray-300'
                  }
                } else if (msg.source === 'guideChat' && !isMyMessage) {
                   // message from partner in guide chat
                   messageStyle = 'bg-indigo-600 text-white'
                }


                return (
                  <div
                    key={index}
                    className={`flex ${isMyMessage && msg.source === 'guideChat' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-3 py-2 rounded-lg max-w-xs lg:max-w-md ${messageStyle}`}
                    >
                      <p className="text-sm font-semibold">{sourceIndicator}{msg.nickname}</p>
                      <p className="text-xs">{msg.message}</p>
                      <p className="text-xxs text-gray-400 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {!isSessionActive && (
              <div className="px-4 py-2 bg-red-900/20 border-t border-red-500/30">
                <p className="text-red-300 text-center text-sm font-medium">Session terminée</p>
              </div>
            )}

            {/* Input Area */}
            {isSessionActive && (
              <div className="p-4 border-t border-purple-500/30">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={'Écrivez votre message...'}
                    disabled={!isSessionActive}
                    className="flex-1 bg-gray-800/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent disabled:opacity-50"
                  />
                  <motion.button
                    type="submit"
                    disabled={!isSessionActive || !newMessage.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: (!isSessionActive || !newMessage.trim()) ? 1 : 1.05 }}
                    whileTap={{ scale: (!isSessionActive || !newMessage.trim()) ? 1 : 0.95 }}
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default GuideChat
