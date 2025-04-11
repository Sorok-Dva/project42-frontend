import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from 'contexts/SocketContext'
import { useUser } from 'contexts/UserContext'
import {
  MessageSquare,
  X,
  Send,
  ChevronUp,
  ChevronDown,
  Users,
} from 'lucide-react'
import axios from 'axios'
import { Container, Spinner } from 'reactstrap'
import { Tooltip } from 'react-tooltip'

interface GuildMessage {
  id? : number
  guildId? : number
  user?: {
    nickname?: string
  }
  userId : number
  nickname : string
  message : string
  createdAt : Date
  isSystem? : boolean
}

interface OnlineUser {
  id : number
  isOnline : boolean
  user: {
    nickname : string
    avatar : string
  }
}

const GuildChat : React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<GuildMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [loading, setLoading] = useState(true)
  const [hasJoined, setHasJoined] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { socket } = useSocket()
  const { user } = useUser()
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasJoined) {
      socket.emit('joinGuildRoom', {
        guildId: user?.guildMembership?.guild.id,
        user: !user ? null : { id: user.id, nickname: user.nickname },
      })
      setHasJoined(true)
    }

    socket.on('guildMessage', (message : GuildMessage) => {
      setMessages((prev) => [...prev, message])
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1)
      }
    })

    socket.on('updateUsers', (users : OnlineUser[]) => {
      console.log(users)
      setOnlineUsers(users)
    })

    return () => {
      socket.off('joinGuildRoom')
      socket.off('guildMessage')
      socket.off('updateUsers')
    }
  }, [socket])

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

  useEffect(() => {
    const fetchGuildsMessagesAndMembers = async () => {
      try {
        const responseMessages = await axios.get<GuildMessage[]>(`/api/guilds/messages/${ user?.guildMembership?.guild.id }`)
        setMessages(() => [{
          id: 0,
          userId: -1,
          nickname: 'Système',
          message: 'Bienvenue dans le tchat de votre station !',
          createdAt: new Date(),
          isSystem: true,
        }, ...responseMessages.data])
        const responseMembers = await axios.get<{ members: OnlineUser[]}>(`/api/guilds/${ user?.guildMembership?.guild.id }/connected`)
        setOnlineUsers(responseMembers.data.members)
      } catch (err : any) {
        console.log('failed to fetch guilds messages or members', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGuildsMessagesAndMembers()
  }, [])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user || !socket) return

    const message : GuildMessage = {
      guildId: user.guildMembership?.guild.id,
      userId: user.id,
      nickname: user.nickname,
      message: newMessage.trim(),
      createdAt: new Date(),
    }

    socket.emit('guildMessage', message)

    setNewMessage('')
  }

  const formatTime = (date : Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const generateTooltipContent = () => {
    return `
      <div class="tooltip-content">
        <h4 class="tooltip-title">Membres connectés</h4>
        <ul class="tooltip-list">
          ${ onlineUsers.map(
    (member) => `
              <li class="tooltip-item">
                <span class="status-dot status-${ member.isOnline ? 'online': 'offline' }"></span>
                <span class="username">${ member.user.nickname }</span>
                <span class="status-text">${ member.isOnline ? 'En ligne': 'Hors ligne' }</span>
             </li>`,
  ).join('') }
        </ul>
      </div>
    `
  }

  return (
    <div className="fixed bottom-0 right-80 z-[100]">
      {/* Bouton du chat */ }
      <div className="relative">
        <motion.button
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-t-lg shadow-lg"
          onClick={ () => setIsOpen(!isOpen) }
          whileHover={ { scale: 1.05 } }
          whileTap={ { scale: 0.95 } }
        >
          <MessageSquare size={ 18 }/>
          <span>Tchat de Guilde</span>
          { isOpen ? <ChevronDown size={ 18 }/>: <ChevronUp size={ 18 }/> }
        </motion.button>

        {/* Badge de notifications */ }
        { !isOpen && unreadCount > 0 && (
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            initial={ { scale: 0 } }
            animate={ { scale: 1 } }
            transition={ { type: 'spring', stiffness: 500, damping: 20 } }
          >
            { unreadCount }
          </motion.div>
        ) }
      </div>

      {/* Fenêtre du chat */ }
      <AnimatePresence>
        { isOpen && (
          <motion.div
            className="bg-gradient-to-r from-black/80 to-blue-900/40 backdrop-blur-md rounded-t-lg border border-blue-500/30 border-b-0 shadow-xl w-80 sm:w-96"
            initial={ { height: 0, opacity: 0 } }
            animate={ { height: 'auto', opacity: 1 } }
            exit={ { height: 0, opacity: 0 } }
            transition={ { type: 'spring', stiffness: 300, damping: 30 } }
          >
            {/* En-tête */ }
            <div
              className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-2 border-b border-blue-500/30 flex justify-between items-center">
              <h3
                className="text-white font-medium">{ user?.guildMembership?.guild.name }</h3>
              <div className="flex items-center">
                {/* Badge des utilisateurs en ligne */ }
                <div
                  className="flex items-center bg-blue-900/50 px-2 py-1 rounded-full mr-3 cursor-help"
                  data-tooltip-id="guild-users-tooltip"
                  data-tooltip-html={ generateTooltipContent() }
                >
                  <Users size={ 14 } className="mr-1 text-blue-300"/>
                  <span
                    className="text-xs font-medium text-blue-300">{ onlineUsers.length }</span>
                  <Tooltip
                    id="guild-users-tooltip"
                    className="tooltip-theme"
                    style={ {
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      padding: '0.75rem',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                      maxWidth: '300px',
                      zIndex: 9999,
                    } }
                  />
                </div>
                <button className="text-gray-300 hover:text-white"
                  onClick={ () => setIsOpen(false) }>
                  <X size={ 18 }/>
                </button>
              </div>
            </div>

            { loading ? (
              <Container className="loader-container">
                <div className="spinner-wrapper">
                  <Spinner animation="border" role="status"
                    className="custom-spinner">
                    <span className="sr-only">Chargement des messages...</span>
                  </Spinner>
                  <div className="loading-text">Chargement des messages...
                  </div>
                </div>
              </Container>
            ): (
              <div
                className="h-[320px] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-black/20"
                ref={ chatContainerRef }
              >
                {/* Messages */ }
                { messages.map((msg) => (
                  <div
                    key={ new Date(msg.createdAt).getTime() }
                    className={ `mb-2 ${ msg.isSystem ? 'bg-blue-900/20 border border-blue-500/30 rounded-lg p-2': '' }` }
                  >
                    { (msg.userId === -1 ||  (msg.user?.nickname ?? msg.nickname) === 'Système') ? (
                      <div
                        className="text-blue-300 text-sm"><span dangerouslySetInnerHTML={{ __html: msg.message }} /></div>
                    ): (
                      <>
                        <div className="flex items-center gap-1">
                          <span
                            className="text-xs text-gray-400">{ formatTime(new Date(msg.createdAt)) }</span>
                          <b
                            className={ `font-medium ${ (msg.user?.nickname ?? msg.nickname) === user?.nickname ? 'text-purple-400': 'text-blue-300' }` }
                          >
                            { msg.user?.nickname ?? msg.nickname }:
                          </b>
                        </div>
                        <div className="text-white pl-4">{ msg.message }</div>
                      </>
                    ) }
                  </div>
                )) }
                <div ref={ messagesEndRef }/>
              </div>
            ) }

            {/* Saisie de message */ }
            <div className="p-3 border-t border-blue-500/30 bg-black/40">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Écrire un message à la station..."
                  value={ newMessage }
                  onChange={ (e) => setNewMessage(e.target.value) }
                  onKeyDown={ (e) => e.key === 'Enter' && handleSendMessage() }
                  className="flex-1 bg-black/60 border border-blue-500/30 rounded-l-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  onClick={ handleSendMessage }
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r-lg transition-colors"
                >
                  <Send size={ 16 }/>
                </button>
              </div>
            </div>
          </motion.div>
        ) }
      </AnimatePresence>
    </div>
  )
}

export default GuildChat
