import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Message, PlayerType, Viewer } from 'hooks/useGame'
import { User } from 'contexts/UserContext'
import { useSocket } from 'contexts/SocketContext'
import { motion } from 'framer-motion'
import ChatMessages, { ChatMessagesHandle } from 'components/Game/ChatMessage'

interface ChatProps {
  gameId: string;
  players?: PlayerType[];
  playerId?: string | number;
  player?: PlayerType;
  user?: User;
  viewer?: Viewer;
  userRole?: string;
  isNight: boolean;
  gameStarted: boolean;
  gameFinished: boolean;
  isArchive: boolean;
  messages: Message[];
  highlightedPlayers: { [nickname: string]: string };
  isInn: boolean;
}

const Chat: React.FC<ChatProps> = ({
  gameId,
  players,
  playerId,
  player,
  user,
  viewer,
  userRole,
  messages,
  highlightedPlayers,
  isNight,
  gameStarted,
  gameFinished,
  isArchive,
  isInn,
}) => {
  const { socket } = useSocket()
  const [newMessage, setNewMessage] = useState('')
  const [currentCommand, setCurrentCommand] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [unreadCount, setUnreadCount] = useState(0)

  // Ref vers le composant ChatMessages qui gère le scroll
  const chatMessagesRef = useRef<ChatMessagesHandle>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleUnreadChange = useCallback((count: number) => {
    setUnreadCount(count)
  }, [])

  // Au montage, on défile vers le bas via ChatMessages
  useEffect(() => {
    chatMessagesRef.current?.scrollToBottom()
  }, [])

  const developerCommand = ['startPhase', 'endPhase', 'listCards']

  const handleSendMessage = () => {
    if (isArchive) return
    const trimmedMessage = newMessage.trim()
    if (!trimmedMessage || !socket) return

    try {
      if (trimmedMessage.startsWith('/')) {
        const commandString = trimmedMessage.slice(1).trim()
        const [command, arg, ...rest] = commandString.split(' ')
        const text = rest.join(' ')

        if (userRole !== 'User') {
          socket.emit(
            developerCommand.includes(command)
              ? 'developerCommand'
              : 'moderationCommand',
            {
              command,
              arg,
              text,
              roomId: gameId,
              playerId,
              currentUserRole: userRole,
              moderator: user,
            }
          )
        } else {
          socket.emit('command',
            {
              command,
              arg,
              text,
              roomId: gameId,
              playerId,
              currentUserRole: userRole,
              user,
            }
          )
        }
      } else {
        let channelToSend = player ? 0 : viewer ? 1 : null
        if (channelToSend === null) return

        // Logique pour déterminer le canal de chat selon le rôle et l'état du jeu
        if (
          isNight &&
          ([2, 9, 20, 21].includes(player?.card?.id || -1) ||
            player?.isInfected) &&
          gameStarted &&
          !gameFinished
        )
          channelToSend = 3
        if (isNight && player?.card?.id === 16 && gameStarted && !gameFinished)
          channelToSend = 4
        if (isNight && player?.card?.id === 17 && gameStarted && !gameFinished)
          channelToSend = 5
        if (
          (isNight && isInn && gameStarted && !gameFinished) ||
          (isNight && player?.card?.id === 23)
        )
          channelToSend = 6

        socket.emit('sendMessage', {
          roomId: gameId,
          playerId,
          viewer,
          content: trimmedMessage,
          channel: channelToSend,
        })
      }

      setNewMessage('')
      setSuggestions([])
      // Après l'envoi, défilement automatique
      chatMessagesRef.current?.scrollToBottom()
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message ou de la commande:', error)
    }
  }

  const handleInputChange = (value: string) => {
    setNewMessage(value)
    if (userRole === 'User') return

    const words = value.trim().split(' ')
    const command = words[0]?.startsWith('/') ? words[0].slice(1) : ''
    const arg = words[1] || ''
    const hasAdditionalArgs = words.length > 2

    setCurrentCommand(command)

    if (
      [
        'kick',
        'ban',
        'mute',
        'unmute',
        'nick',
        'crea',
        'card',
        'kill',
        'revive',
        'achievement',
        'mp'
      ].includes(command) &&
      !hasAdditionalArgs
    ) {
      const searchQuery = arg.toLowerCase()
      const filteredSuggestions =
        players
          ?.filter(
            (p) =>
              p.nickname.toLowerCase().includes(searchQuery) &&
              p.id !== playerId
          )
          .map((p) => p.nickname) || []
      setSuggestions(filteredSuggestions)
    } else {
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (command: string, nickname: string) => {
    setNewMessage(`/${command} ${nickname} `)
    setSuggestions([])
    inputRef.current?.focus()
  }

  const handleMentionClick = (nickname: string) => {
    setNewMessage((prev) => `${prev.trim()} @${nickname} `)
    inputRef.current?.focus()
  }

  return (
    <motion.div
      className="flex flex-col h-full bg-gradient-to-r from-black/90 to-blue-950/20 backdrop-blur-xl rounded-xl border border-blue-500/30 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      ref={containerRef}
    >
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-blue-500/30 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Communication</h3>
        {unreadCount > 0 && (
          <div
            className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full cursor-pointer animate-pulse"
            onClick={() => chatMessagesRef.current?.scrollToBottom()}
          >
            {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''} message
            {unreadCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Zone de messages */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-black/20">
        {/* Règles du jeu */ }
        <div
          className="mb-4 p-3 bg-black/40 rounded-lg border border-blue-500/20">
          <p className="text-blue-200 text-sm mb-2">
            <span className="font-bold text-white">Rappel :</span> vous êtes
            sur une partie{ ' ' }
            <span
              className="inline-block w-3 h-3 rounded-full bg-green-500 align-middle mx-1"></span>{ ' ' }
            <strong>Normale</strong>
          </p>
          <ul
            className="list-disc list-inside text-xs text-blue-200 space-y-1">
            <li>
              Il est strictement <strong>interdit d'insulter</strong> un autre
              joueur et d'avoir une attitude malsaine.
            </li>
            <li>
              Le dévoilement
              est <strong>interdit</strong> et <strong>sanctionné</strong> systématiquement.
            </li>
            <li>
              Tous les joueurs <strong>doivent</strong> participer au débat. Il
              n'est pas autorisé d'être{ ' ' }
              <strong>AFK</strong>.
            </li>
          </ul>
          <p className="text-xs text-blue-200 mt-2">
            <strong>Rappel :</strong> ne divulguez <strong>jamais</strong> vos
            informations privées sur le jeu.
          </p>
        </div>
        <hr />

        {/* Messages */ }
        <ChatMessages
          ref={chatMessagesRef}
          messages={messages}
          highlightedPlayers={highlightedPlayers}
          player={player}
          viewer={viewer}
          isNight={isNight}
          gameFinished={gameFinished}
          handleMentionClick={handleMentionClick}
          isInn={isInn}
          onUnreadChange={handleUnreadChange}
        />
      </div>

      {/* Zone de saisie */}
      {!isArchive &&
        (player ||
          viewer?.user?.id ||
          (!player &&
            [
              'SuperAdmin',
              'Admin',
              'Developer',
              'Moderator',
              'ModeratorTest',
            ].includes(userRole as string))) && (
        <div className="relative p-3 border-t border-blue-500/30 bg-black/40">
          <div className="flex">
            <input
              type="text"
              placeholder="Écrire un message..."
              value={newMessage}
              ref={inputRef}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (suggestions.length > 0) {
                  if (e.key === 'ArrowDown') {
                    setSelectedIndex((prev) => (prev + 1) % suggestions.length)
                    e.preventDefault()
                  } else if (e.key === 'ArrowUp') {
                    setSelectedIndex(
                      (prev) => (prev - 1 + suggestions.length) % suggestions.length
                    )
                    e.preventDefault()
                  } else if (e.key === 'Enter') {
                    if (selectedIndex === -1) {
                      setSelectedIndex(0)
                      setNewMessage(`/${currentCommand} ${suggestions[0]} `)
                      setSuggestions([])
                      e.preventDefault()
                    } else if (selectedIndex >= 0) {
                      const chosenNickname = suggestions[selectedIndex]
                      setNewMessage(`/${currentCommand} ${chosenNickname} `)
                      setSelectedIndex(-1)
                      setSuggestions([])
                      e.preventDefault()
                    }
                  }
                } else if (e.key === 'Enter') {
                  handleSendMessage()
                }
              }}
              className="flex-1 bg-black/60 border border-blue-500/30 rounded-l-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              maxLength={500}
              autoComplete="off"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mt-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="sound-tick absolute bottom-full left-0 w-full bg-black/80 border border-blue-500/30 rounded-t-lg max-h-40 overflow-y-auto z-10">
              {suggestions.map((nickname, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 cursor-pointer ${
                    selectedIndex === index
                      ? 'bg-blue-900/50'
                      : 'hover:bg-blue-900/30'
                  }`}
                  onClick={() => handleSuggestionClick(currentCommand, nickname)}
                >
                  {nickname}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default Chat
