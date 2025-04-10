import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from 'contexts/SocketContext'
import { useUser } from 'contexts/UserContext'
import { MessageSquare, X, Send, ChevronUp, ChevronDown } from 'lucide-react'

interface GuildMessage {
  id: string
  userId: string
  username: string
  content: string
  timestamp: Date
  isSystem?: boolean
}

const GuildChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<GuildMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { socket } = useSocket()
  const { user } = useUser()
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Simuler des messages pour la démo
  useEffect(() => {
    const demoMessages: GuildMessage[] = [
      {
        id: '1',
        userId: 'system',
        username: 'Système',
        content: 'Bienvenue dans le tchat de la guilde Explorateurs Stellaires!',
        timestamp: new Date(Date.now() - 3600000),
        isSystem: true,
      },
      {
        id: '2',
        userId: 'user1',
        username: 'CommandantNova',
        content: 'Salut tout le monde! Qui est partant pour une mission d\'exploration ce soir?',
        timestamp: new Date(Date.now() - 1800000),
      },
      {
        id: '3',
        userId: 'user2',
        username: 'AstroHunter',
        content: 'Je suis disponible après 20h!',
        timestamp: new Date(Date.now() - 900000),
      },
      {
        id: '4',
        userId: 'user3',
        username: 'StarNavigator',
        content: 'J\'ai découvert un nouveau système hier, il faut absolument qu\'on y retourne explorer.',
        timestamp: new Date(Date.now() - 600000),
      },
      {
        id: '5',
        userId: 'user1',
        username: 'CommandantNova',
        content: 'Super! On se retrouve à la station Alpha à 20h30 alors.',
        timestamp: new Date(Date.now() - 300000),
      },
    ]

    setMessages(demoMessages)
  }, [])

  // Simuler la réception de nouveaux messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const users = ['GalaxyQueen', 'NebulaCaptain', 'VoidWalker', 'StarDust', 'CosmicRay']
        const contents = [
          'Quelqu\'un a des ressources de tritium à échanger?',
          'Je viens de terminer une mission de niveau 5!',
          'La nouvelle mise à jour est incroyable!',
          'Qui veut former une équipe pour le raid de ce weekend?',
          'J\'ai trouvé un artefact rare dans le secteur Omega!',
        ]

        const randomUser = users[Math.floor(Math.random() * users.length)]
        const randomContent = contents[Math.floor(Math.random() * contents.length)]

        const newMsg: GuildMessage = {
          id: Date.now().toString(),
          userId: `random-${Date.now()}`,
          username: randomUser,
          content: randomContent,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, newMsg])

        if (!isOpen) {
          setUnreadCount((prev) => prev + 1)
        }
      }
    }, 15000) // Nouveau message potentiel toutes les 15 secondes

    return () => clearInterval(interval)
  }, [isOpen])

  // Défiler vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // Réinitialiser le compteur de messages non lus quand le chat est ouvert
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return

    const message: GuildMessage = {
      id: Date.now().toString(),
      userId: user.id.toString(),
      username: user.nickname || 'Anonyme',
      content: newMessage.trim(),
      timestamp: new Date(),
    }

    // Simuler l'envoi au serveur
    socket?.emit('guildMessage', message)

    // Ajouter localement
    setMessages((prev) => [...prev, message])
    setNewMessage('')
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="fixed bottom-0 right-80 z-[100]">
      {/* Bouton du chat */}
      <div className="relative">
        <motion.button
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-t-lg shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageSquare size={18} />
          <span>Tchat de Guilde</span>
          {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </motion.button>

        {/* Badge de notifications */}
        {!isOpen && unreadCount > 0 && (
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          >
            {unreadCount}
          </motion.div>
        )}
      </div>

      {/* Fenêtre du chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="bg-gradient-to-r from-black/80 to-blue-900/40 backdrop-blur-md rounded-t-lg border border-blue-500/30 border-b-0 shadow-xl w-80 sm:w-96"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* En-tête */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-2 border-b border-blue-500/30 flex justify-between items-center">
              <h3 className="text-white font-medium">{ user?.guildMembership?.guild.name }</h3>
              <button className="text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div
              className="h-[320px] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-black/20"
              ref={chatContainerRef}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 ${msg.isSystem ? 'bg-blue-900/20 border border-blue-500/30 rounded-lg p-2' : ''}`}
                >
                  {msg.isSystem ? (
                    <div className="text-blue-300 text-sm">{msg.content}</div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">{formatTime(new Date(msg.timestamp))}</span>
                        <span
                          className={`font-medium ${msg.userId === user?.id?.toString() ? 'text-purple-400' : 'text-blue-300'}`}
                        >
                          {msg.username}:
                        </span>
                      </div>
                      <div className="text-white text-sm pl-4">{msg.content}</div>
                    </>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Saisie de message */}
            <div className="p-3 border-t border-blue-500/30 bg-black/40">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Écrire un message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-black/60 border border-blue-500/30 rounded-l-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r-lg transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GuildChat
