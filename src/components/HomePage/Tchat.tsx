import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from 'contexts/SocketContext'
import { useUser } from 'contexts/UserContext'
import { X, Send, ChevronUp, ChevronDown, Users, Search, ArrowLeft, MessageSquare } from 'lucide-react'
import axios from 'axios'
import { Tooltip } from 'react-tooltip'
import type { Conversation, GuildMessage, OnlineUser, PrivateMessage } from 'types/tchat'
import { Friendship } from 'components/Layouts/navbar/Friends'
import { useAuth } from 'contexts/AuthContext'
import { Container, Spinner } from 'reactstrap'

const UnifiedChat: React.FC = () => {
  const { socket } = useSocket()
  const { user } = useUser()
  const { token } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<'contacts' | 'conversation' | 'guild'>('contacts')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([])
  const [guildMessages, setGuildMessages] = useState<GuildMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [guildUnreadCount, setGuildUnreadCount] = useState(0)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [loading, setLoading] = useState(true)
  const [hasJoined, setHasJoined] = useState(false)
  const [contacts, setContacts] = useState<Friendship[]>([])
  const [footerVisible, setFooterVisible] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const tooltipId = 'chat-users-tooltip'

  const audioNotif = new Audio('/assets/sounds/pm-notif.wav')

  useEffect(() => {
    if (!hasJoined && socket && user?.guildMembership?.guild?.id) {
      socket.emit('joinGuildRoom', {
        guildId: user.guildMembership.guild.id,
        user: !user ? null : { id: user.id, nickname: user.nickname },
      })
      setHasJoined(true)
    }

    if (socket) {
      socket.on('privateMessage', (message: PrivateMessage) => {
        audioNotif.currentTime = 0
        audioNotif.play().catch(() => {})

        setPrivateMessages(prev => [...prev, message])

        setConversations(prev =>
          prev.map(c => {
            if (c.id === message.conversationId) {
              const isViewingThis =
                view === 'conversation' &&
                activeConversation?.id === c.id

              if (isViewingThis) {
                axios.put(
                  `/api/private/${c.id}/read`,
                  {},
                  { headers: { Authorization: `Bearer ${token}` } }
                ).catch(console.error)
              }
              return {
                ...c,
                lastMessage: message,
                unreadCount: isViewingThis
                  ? 0
                  : (c.unreadCount ?? 0) + 1,
              }
            }
            return c
          })
        )

        if (!isOpen || view !== 'conversation') {
          setUnreadCount(prev => prev + 1)
        }
      })

      socket.on('guildMessage', (message: GuildMessage) => {
        audioNotif.currentTime = 0
        audioNotif.play().catch(() => {})
        setGuildMessages((prev) => [...prev, message])
        if (!isOpen || view !== 'guild') {
          setGuildUnreadCount((prev) => prev + 1)
        }
      })

      socket.on('updateUsers', (users: OnlineUser[]) => {
        setOnlineUsers(users)
      })

      return () => {
        socket.off('joinGuildRoom')
        socket.off('privateMessage')
        socket.off('guildMessage')
        socket.off('updateUsers')
      }
    }
  }, [socket, user, hasJoined, isOpen, view])

  useEffect(() => {
    const footer = document.getElementById('site-footer')
    if (!footer) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        console.log('footerVisible =', entry.isIntersecting)
        setFooterVisible(entry.isIntersecting)
      },
      { threshold: 0 }
    )
    obs.observe(footer)
    return () => obs.disconnect()
  }, [])

  // Défiler vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [privateMessages, guildMessages, isOpen])

  // Réinitialiser le compteur de messages non lus quand le chat est ouvert
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen])

  useEffect(() => {
    const fetchGuildsMessagesAndMembers = async () => {
      try {
        if (user?.guildMembership?.guild?.id) {
          const responseMessages = await axios.get<GuildMessage[]>(
            `/api/guilds/messages/${user.guildMembership.guild.id}`,
          )
          setGuildMessages(() => [
            {
              id: Math.random(),
              userId: Math.random(),
              nickname: 'Système',
              message: 'Bienvenue dans le tchat de votre station !',
              createdAt: new Date(),
              isSystem: true,
            },
            ...responseMessages.data,
          ])

          const responseMembers = await axios.get<{
            members: OnlineUser[]
          }>(`/api/guilds/${user.guildMembership.guild.id}/connected`)
          setOnlineUsers(responseMembers.data.members)
        }
      } catch (err: any) {
        console.log('failed to fetch guilds messages or members', err)

        setGuildMessages([
          {
            id: 0,
            userId: -1,
            nickname: 'Système',
            message: 'Une erreur est survenue dans la récupération des messages',
            createdAt: new Date(),
            isSystem: true,
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchGuildsMessagesAndMembers()
  }, [user])

  useEffect(() => {
    const fetchFriendships = async () => {
      try {
        const response = await axios.get<Friendship[]>('/api/friends', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setContacts(response.data.filter(f => f.friendshipStatus === 'accepted'))
      } catch (error) {
        console.error('Erreur lors du chargement des amitiés', error)
      }
    }

    const fetchLastMessages = async () => {
      try {
        const response = await axios.get('/api/private/getLastConv', {
          headers: {
            Authorization: `Bearer ${ token }`,
          },
        })
        setConversations(response.data)

      } catch (error) {
        console.error('Erreur lors de la récupération des conversations:', error)
      }
    }

    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get<number>('/api/private/unreadCount', {
          headers: {
            Authorization: `Bearer ${ token }`,
          },
        })
        setUnreadCount(prev => prev + response.data)

      } catch (error) {
        console.error('Erreur lors de la récupération des conversations:', error)
      }
    }

    fetchFriendships()
    fetchLastMessages()
    fetchUnreadCount()
  }, [isOpen])

  useEffect(() => {
    if (activeConversation) {
      const fetchMessages = async () => {
        try {
          setLoading(true)
          const response = await axios.get<PrivateMessage[]>(
            `/api/private/${ activeConversation.id }`, {
              headers: {
                Authorization: `Bearer ${ token }`,
              }
            }
          )
          setPrivateMessages(response.data)
          await axios.put(`/api/private/${activeConversation.id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } })
        } catch (error) {
          console.error('Erreur lors de la récupération des messages privés:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchMessages ()
    }
  }, [activeConversation])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user || !socket) return

    if (view === 'guild') {
      const message: GuildMessage = {
        guildId: user.guildMembership!.guild.id,
        userId: user.id,
        nickname: user.nickname,
        message: newMessage.trim(),
        createdAt: new Date(),
      }
      socket.emit('guildMessage', message)
      setGuildMessages(prev => [...prev, message])
    } else if (view === 'conversation' && activeConversation) {
      const conversation = activeConversation

      const other = conversation.participants.find(p => p.id !== user.id)
      if (!other) return

      const privateMsg: PrivateMessage = {
        conversationId: conversation.id,
        senderId: user.id,
        receiverId: other.id,
        message: newMessage.trim(),
        createdAt: new Date(),
        read: false,
      }

      socket.emit('privateMessage', privateMsg)

      setConversations(prev =>
        prev.map(c =>
          c.id === conversation.id ? { ...c, lastMessage: privateMsg } : c
        )
      )
      setPrivateMessages(prev => [...prev, privateMsg])
    }

    setNewMessage('')
  }

  // Défiler vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [privateMessages, guildMessages, isOpen, view])

  // Réinitialiser le compteur de messages non lus quand le chat est ouvert
  useEffect(() => {
    if (isOpen && view === 'guild') {
      setGuildUnreadCount(0)
    }
  }, [isOpen, view])

  const openConversation = (conversation: Conversation) => {
    setActiveConversation(conversation)
    setView('conversation')

    setConversations(prev =>
      prev.map(c =>
        c.id === conversation.id
          ? { ...c, unreadCount: 0 }
          : c
      )
    )
    axios.put(`/api/private/${conversation.id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } }).catch(console.error)
  }

  const openGuildChat = () => {
    setView('guild')
    setGuildUnreadCount(0)
  }

  const backToContacts = () => {
    setActiveConversation(null)
    setView('contacts')
  }

  const formatTime = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date)
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
    case 'online':
      return 'bg-green-500'
    case 'away':
      return 'bg-yellow-500'
    case 'busy':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
    }
  }

  const getOtherParticipant = (conversation: Conversation): Friendship | undefined => {
    const other = conversation.participants.find(p => p.nickname !== user?.nickname)
    if (!other) return undefined

    return contacts.find(c => c.nickname === other.nickname)
  }

  const filteredContacts = contacts.filter((contact) =>
    (contact.nickname as string).toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Générer le contenu HTML du tooltip
  const generateTooltipContent = () => {
    const onlineContacts = contacts.filter((c) => c.status === 'online')

    return `
      <div class="tooltip-content">
        <h4 class="tooltip-title">Contacts en ligne</h4>
        <ul class="tooltip-list">
          ${onlineContacts
    .map(
      (contact) => `
            <li class="tooltip-item">
              <span class="status-dot status-${contact.status}"></span>
              <span class="username">${contact.nickname}</span>
            </li>
          `,
    )
    .join('')}
        </ul>
      </div>
    `
  }

  const onlineContactsCount = contacts.filter((c) => c.isOnline).length
  const totalUnreadCount = unreadCount + guildUnreadCount

  const generateGuildMembersTooltipContent = () => {
    return `
      <div class="tooltip-content">
        <h4 class="tooltip-title">Membres connectés</h4>
        <ul class="tooltip-list">
          ${onlineUsers
    .map(
      (member) => `
              <li class="tooltip-item">
                <span class="status-dot status-${member.isOnline ? 'online' : 'offline'}"></span>
                <span class="username">${member.user.nickname}</span>
                <span class="status-text">${member.isOnline ? 'En ligne' : 'Hors ligne'}</span>
             </li>`,
    )
    .join('')}
        </ul>
      </div>
    `
  }

  return (
    <div className={`
      fixed
      right-80
      z-[100]
      ${footerVisible ? 'bottom-[70px]' : 'bottom-0'}
      ${isOpen ? 'w-25' : ''}
    `}>
      {/* Bouton du chat */}
      { !isOpen && (
        <div className="relative">
          <motion.button
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-t-lg shadow-lg"
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users size={18} />
            <span className="font-medium">Messages</span>
            {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}

            {/* Badge de notifications */}
            {!isOpen && totalUnreadCount > 0 && (
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                {totalUnreadCount}
              </motion.div>
            )}
          </motion.button>
        </div>
      )}

      {/* Fenêtre du chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-0 bg-gradient-to-r from-black/80 to-blue-900/40 backdrop-blur-md rounded-t-lg border border-blue-500/30 border-b-0 shadow-xl w-full max-w-md"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* En-tête */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-4 py-3 border-b border-blue-500/30 flex justify-between items-center">
              {view === 'conversation' && activeConversation ? (
                <>
                  <button className="text-gray-300 hover:text-white mr-2" onClick={backToContacts}>
                    <ArrowLeft size={18} />
                  </button>
                  <h3 className="text-white font-medium flex-1">
                    {activeConversation &&
                      conversations.find((c) => c.id === activeConversation.id) &&
                      getOtherParticipant(conversations.find((c) => c.id === activeConversation.id) as Conversation) &&
                      (getOtherParticipant(conversations.find((c) => c.id === activeConversation.id) as Conversation)
                        ?.nickname as string)}
                  </h3>
                  <div
                    className={`bottom-0 right-0 w-3 h-3 rounded-full ${
                      getStatusColor(
                        getOtherParticipant(
                          conversations.find((c) => c.id === activeConversation.id) as Conversation
                        )?.isOnline ? 'online' : 'offline',
                      )
                    } border-2 border-black`}
                  />
                </>
              ) : view === 'guild' ? (
                <>
                  <button className="text-gray-300 hover:text-white mr-2" onClick={backToContacts}>
                    <ArrowLeft size={18} />
                  </button>
                  <h3 className="text-white font-medium flex-1">Station: {user?.guildMembership?.guild.name}</h3>
                </>
              ) : (
                <h3 className="text-white font-medium">Messagerie</h3>
              )}

              <div className="flex items-center">
                {/* Badge des contacts en ligne */}
                {view === 'contacts' && (
                  <div
                    className="flex items-center bg-purple-900/50 px-2 py-1 rounded-full mr-3 cursor-help"
                    data-tooltip-id={tooltipId}
                    data-tooltip-html={generateTooltipContent()}
                  >
                    <Users size={14} className="mr-1 text-purple-300" />
                    <span className="text-xs font-medium text-purple-300">{onlineContactsCount}</span>
                  </div>
                )}
                {view === 'guild' && (
                  <div
                    className="flex items-center bg-purple-900/50 px-2 py-1 rounded-full mr-3 cursor-help"
                    data-tooltip-id={tooltipId}
                    data-tooltip-html={generateGuildMembersTooltipContent()}
                  >
                    <Users size={14} className="mr-1 text-purple-300" />
                    <span className="text-xs font-medium text-purple-300">{onlineUsers.length}</span>
                  </div>
                )}
                <button className="text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {view === 'contacts' ? (
              <>
                {/* Barre de recherche */}
                <div className="p-3 border-b border-blue-500/30 bg-black/40">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un contact..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/60 border border-blue-500/30 rounded-lg pl-10 pr-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                {/* Canal de guilde en haut de la liste */}
                <div
                  className="flex items-center p-3 border-b border-blue-500/20 bg-gradient-to-r from-blue-900/20 to-purple-900/20 hover:from-blue-900/30 hover:to-purple-900/30 cursor-pointer transition-colors"
                  onClick={openGuildChat}
                >
                  <div className="relative mr-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-white font-bold">
                      <MessageSquare size={18} />
                    </div>
                    {guildUnreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {guildUnreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-white">Station: {user?.guildMembership?.guild.name}</span>
                      {guildMessages.length > 0 && (
                        <span className="text-xs text-gray-400">
                          {formatTime(guildMessages[guildMessages.length - 1].createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400 truncate max-w-[180px]">
                        {guildMessages.length > 0
                          ? `${guildMessages[guildMessages.length - 1].user?.nickname || guildMessages[guildMessages.length - 1].nickname}: ${
                            guildMessages[guildMessages.length - 1].message
                          }`
                          : 'Aucun message récent'}
                      </span>
                      {guildUnreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {guildUnreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Liste des contacts */}
                <div
                  className="h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-black/20"
                  ref={chatContainerRef}
                >
                  {filteredContacts.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">Aucun contact trouvé</div>
                  ) : (
                    filteredContacts.map((contact) => {
                      // Trouver la conversation correspondante
                      const conversation = conversations.find((c) =>
                        c.participants.some(p => p.nickname === contact.nickname) &&
                        c.participants.some(p => p.nickname === (user?.nickname ?? ''))
                      )

                      return (
                        <div
                          key={contact.nickname}
                          className="flex items-center p-3 border-b border-blue-500/10 hover:bg-blue-900/20 cursor-pointer transition-colors"
                          onClick={() => {
                            if (conversation) {
                              openConversation(conversation)
                            } else {
                              // Créer une nouvelle conversation si elle n'existe pas
                              const newConversation: Conversation = {
                                id: contact.id,
                                participants: [{
                                  id: user?.id || 0,
                                  nickname: user?.nickname || '',
                                }, {
                                  id: contact.addresseeId === user?.id ? contact.requesterId : contact.addresseeId,
                                  nickname: contact.nickname,
                                }],
                                unreadCount: 0,
                              }
                              setConversations((prev) => [...prev, newConversation])
                              setActiveConversation(newConversation)
                              openConversation(newConversation)
                            }
                          }}
                        >
                          <div className="relative mr-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center text-white font-bold">
                              {(contact.nickname).charAt(0)}
                            </div>
                            <div
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getStatusColor(
                                contact.status,
                              )} border-2 border-black`}
                            ></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="font-medium text-white">{contact.nickname as string}</span>
                              {conversation?.lastMessage && (
                                <span className="text-xs text-gray-400">
                                  {formatTime(conversation.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400 max-w-[250px]">
                                {conversation?.lastMessage
                                  ? conversation.lastMessage.message
                                  : 'Commencer une conversation'}
                              </span>
                              {conversation && conversation.unreadCount > 0 && (
                                <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </>
            ) : view === 'guild' ? (
              <>
                {/* Messages de guilde */}
                <div
                  className="h-[350px] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-black/20"
                  ref={chatContainerRef}
                >
                  {guildMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-2 ${msg.isSystem ? 'bg-blue-900/20 border border-blue-500/30 rounded-lg p-2' : ''}`}
                    >
                      {msg.isSystem ? (
                        <div className="text-blue-300 text-sm">{msg.message}</div>
                      ) : (
                        <>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">{formatTime(new Date(msg.createdAt))}</span>
                            <span
                              className={`font-medium ${msg.userId === user?.id ? 'text-purple-400' : 'text-blue-300'}`}
                            >
                              {msg.user?.nickname || msg.nickname}:
                            </span>
                          </div>
                          <div className="text-white text-sm pl-4">{msg.message}</div>
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Saisie de message pour la guilde */}
                <div className="p-3 border-t border-blue-500/30 bg-black/40">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Écrire un message à la guilde..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-black/60 border border-blue-500/30 rounded-l-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 py-2 rounded-r-lg transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Messages privés */}
                <div
                  className="h-[350px] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-black/20"
                  ref={chatContainerRef}
                >
                  { loading && (
                    <Container className="loader-container loader-container-two">
                      <div className="spinner-wrapper">
                        <Spinner className="custom-spinner" />
                        <div className="loading-text">Chargement de votre conversation avec {activeConversation?.participants.filter(n => n.nickname !== user?.nickname || '')[0].nickname}...</div>
                      </div>
                    </Container>
                  )}
                  {privateMessages.map((msg, i) => {
                    const isFromMe = msg.senderId === user?.id

                    return (
                      <div key={i} className={`mb-3 flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 ${
                            !isFromMe
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                              : 'bg-black/40 border border-blue-500/20 text-white'
                          }`}
                        >
                          <div className="text-sm">{msg.message}</div>
                          <div className="text-xs text-right mt-1 opacity-70">
                            {formatTime(new Date(msg.createdAt))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Saisie de message privé */}
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
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-3 py-2 rounded-r-lg transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip pour la liste des contacts */}
      <Tooltip
        id={tooltipId}
        className="tooltip-theme"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderRadius: '0.5rem',
          border: '1px solid rgba(147, 51, 234, 0.3)',
          padding: '0.75rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          maxWidth: '300px',
          zIndex: 9999,
        }}
      />
    </div>
  )
}

export default UnifiedChat
