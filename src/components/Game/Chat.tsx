import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Message, Viewer } from 'hooks/useGame'
import type { User } from 'types/user'
import { useSocket } from 'contexts/SocketContext'
import { motion } from 'framer-motion'
import ChatMessages, { ChatMessagesHandle } from 'components/Game/ChatMessage'
import GameRule from 'components/Game/Rules'
import axios from 'axios'
import { Player } from 'types/room'

interface ChatProps {
  gameId: string
  players?: Player[]
  playerId?: string | number
  player?: Player
  user?: User
  viewer?: Viewer
  userRole?: string
  isNight: boolean
  gameStarted: boolean
  gameFinished: boolean
  isArchive: boolean
  messages: Message[]
  highlightedPlayers: { [nickname: string]: string }
  isInn: boolean
  gameType: number
}

interface GiphyResult {
  id: string
  url: string
  images: {
    fixed_height_small: {
      url: string
      width: string
      height: string
    }
  }
}

interface Emote {
  code: string
  path: string
  name: string
  h: number
}

const emojis = [
  '😀',
  '😂',
  '😍',
  '🤔',
  '😎',
  '👍',
  '👎',
  '🔥',
  '❤️',
  '💯',
  '🚀',
  '✨',
  '👽',
  '🤖',
  '🏆',
  '⚔️',
  '🛡️',
  '🧪',
  '💣',
  '⚡',
  '🌌',
  '🌠',
]

export const emotes: Emote[] = [
  { code: ':\'(', path: '/assets/images/emotes/6.png', name: 'Triste', h: 18 },
  { code: ':v', path: '/assets/images/emotes/7.png', name: ':v', h: 18 },
  { code: ':angel', path: '/assets/images/emotes/angel.png', name: 'Ange', h: 18 },
  { code: ':aw', path: '/assets/images/emotes/aw.png', name: 'Awesome', h: 22 },
  { code: ':marvin', path: '/assets/images/emotes/marvin.png', name: 'Marvin', h: 24 },
  { code: ':_marvin', path: '/assets/images/emotes/marvin2.png', name: 'Marvin', h: 28 },
  { code: ':42', path: '/assets/images/emotes/42underline.png', name: '42', h: 24 },
  { code: ':non', path: '/assets/images/emotes/cestNon.png', name: 'C\'est non', h: 28 },
  { code: ':facepalm', path: '/assets/images/emotes/facepalm.png', name: 'Facepalm', h: 24 },
  { code: '<3', path: '/assets/images/emotes/c.png', name: 'Coeur', h: 18 },
  { code: ':keur', path: '/assets/images/emotes/keur.png', name: 'Keur', h: 18 },
  { code: ':fakenews', path: '/assets/images/emotes/fakenews.gif', name: 'Fake News', h: 28 },
  { code: ':truenews', path: '/assets/images/emotes/truenews.gif', name: 'True News', h: 28 },
  { code: ':trollface', path: '/assets/images/emotes/trollface.png', name: 'Troll face', h: 18 },
  { code: ':smart', path: '/assets/images/emotes/smart.png', name: 'Smart', h: 18 },
  { code: ':wat', path: '/assets/images/emotes/wat.png', name: 'Wat', h: 24 },
  { code: ':sueur', path: '/assets/images/emotes/sueur.png', name: 'Sueur', h: 18 },
  { code: ':thonk', path: '/assets/images/emotes/thonk.png', name: 'Thonk', h: 18 },
  { code: ':cookie', path: '/assets/images/emotes/cookie.gif', name: 'Cookie', h: 18 },
  { code: ':cool', path: '/assets/images/emotes/cool.png', name: 'Cool', h: 18 },
  { code: ':bucher', path: '/assets/images/emotes/bucher.png', name: 'Bucher', h: 18 },
  { code: ':biche', path: '/assets/images/emotes/biche.png', name: 'Biche', h: 18 },
  { code: ':duck', path: '/assets/images/emotes/duck.png', name: 'Canard', h: 18 },
  { code: ':eye', path: '/assets/images/emotes/eye.png', name: 'Oeil', h: 18 },
  { code: ':hamster', path: '/assets/images/emotes/hamster.png', name: 'Hamster', h: 18 },
  { code: ':hamsterjedi', path: '/assets/images/emotes/hamsterjedi.png', name: 'Hamster Jedi', h: 18 },
  { code: ':mousse', path: '/assets/images/emotes/mousse.png', name: 'Mousse', h: 28 },
  { code: ':mouton', path: '/assets/images/emotes/mouton.png', name: 'mouton', h: 18 },
  { code: ':ninja', path: '/assets/images/emotes/ninja.png', name: 'Ninja', h: 18 },
  { code: ':noel', path: '/assets/images/emotes/noel.gif', name: 'Noel', h: 18 },
  { code: ':penguin', path: '/assets/images/emotes/penguin.gif', name: 'Penguin', h: 18 },
  { code: ':phoque', path: '/assets/images/emotes/phoque.png', name: 'Phoque', h: 18 },
  { code: ':porte', path: '/assets/images/emotes/porte.png', name: 'Porte', h: 24 },
  { code: ':rip', path: '/assets/images/emotes/rip.png', name: 'RIP', h: 24 },
  { code: ':alien', path: '/assets/images/emotes/alien.png', name: 'Alien', h: 30 },
  { code: ':inno', path: '/assets/images/emotes/membre_equipage.png', name: 'Membre d\'équipage', h: 30 },
  { code: ':coordinateur', path: '/assets/images/emotes/coordinateur.png', name: 'Coordinateur', h: 30 },
  { code: ':analyste', path: '/assets/images/emotes/analyste.png', name: 'Analyste', h: 30 },
  { code: ':medecin', path: '/assets/images/emotes/medecin.png', name: 'Medecin', h: 30 },
  { code: ':bi', path: '/assets/images/emotes/bi.png', name: 'Bio-ingénieure', h: 30 },
  { code: ':te', path: '/assets/images/emotes/te.png', name: 'Tireur d\'élite', h: 30 },
]

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
  gameType,
}) => {
  const { socket } = useSocket()
  const [newMessage, setNewMessage] = useState('')
  const [currentCommand, setCurrentCommand] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [unreadCount, setUnreadCount] = useState(0)
  const [giphyResults, setGiphyResults] = useState<GiphyResult[]>([])
  const [isSearchingGifs, setIsSearchingGifs] = useState(false)
  const [giphySearchTerm, setGiphySearchTerm] = useState('')
  const giphyApiKey = process.env.REACT_APP_GIPHY_API_KEY || ''
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([])
  const [mentionIndex, setMentionIndex] = useState(-1)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

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

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  // Ajouter cette fonction après handleEmojiSelect
  const handleEmoteSelect = (emoteCode: string) => {
    setNewMessage((prev) => prev + ' ' + emoteCode + ' ')
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  const developerCommand = ['startPhase', 'endPhase', 'listCards']

  const searchGiphy = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setGiphyResults([])
        return
      }

      setIsSearchingGifs(true)
      try {
        const response = await axios.get(
          `https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${encodeURIComponent(
            searchTerm,
          )}&limit=8&rating=g`,
        )
        setGiphyResults(response.data.data)
      } catch (error) {
        console.error('Erreur lors de la recherche Giphy:', error)
      } finally {
        setIsSearchingGifs(false)
      }
    },
    [giphyApiKey],
  )

  const handleSendMessage = () => {
    if (isArchive) return
    const trimmedMessage = newMessage.trim()
    if (!trimmedMessage || !socket) return

    try {
      if (trimmedMessage.startsWith('/')) {
        if (userRole !== 'User') {
          const commandString = trimmedMessage.slice(1).trim()
          const [command, arg, ...rest] = commandString.split(' ')
          const text = rest.join(' ')
          socket.emit(developerCommand.includes(command) ? 'developerCommand' : 'moderationCommand', {
            command,
            arg,
            text,
            roomId: gameId,
            playerId,
            currentUserRole: userRole,
            moderator: user,
          })
        }
      } else {
        let channelToSend = player ? 0 : viewer ? 1 : null
        if (channelToSend === null) return

        // Logique pour déterminer le canal de chat selon le rôle et l'état du jeu
        if (
          isNight &&
          ([2, 9, 20, 21].includes(player?.card?.id || -1) || player?.isInfected) &&
          gameStarted &&
          !gameFinished
        )
          channelToSend = 3
        if (isNight && player?.card?.id === 16 && gameStarted && !gameFinished) channelToSend = 4
        if (isNight && player?.card?.id === 17 && gameStarted && !gameFinished) channelToSend = 5
        if ((isNight && isInn && gameStarted && !gameFinished) || (isNight && player?.card?.id === 23))
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

  const handleMentionSuggestions = (value: string) => {
    // Vérifier si on est en train de taper une mention
    const lastAtSymbolIndex = value.lastIndexOf('@')
    if (lastAtSymbolIndex === -1) {
      setMentionSuggestions([])
      return
    }

    // Extraire le texte après le dernier @ jusqu'au curseur
    const mentionText = value
      .slice(lastAtSymbolIndex + 1)
      .split(' ')[0]
      .toLowerCase()

    // Si on vient juste de taper @ sans texte après, montrer tous les joueurs
    if (mentionText === '') {
      const allPlayerNames = players?.map((p) => p.nickname) || []
      setMentionSuggestions(allPlayerNames)
      setMentionIndex(-1)
      return
    }

    // Filtrer les joueurs dont le pseudo commence par le texte tapé
    const filteredPlayers =
      players?.filter((p) => p.nickname.toLowerCase().includes(mentionText)).map((p) => p.nickname) || []

    setMentionSuggestions(filteredPlayers)
    setMentionIndex(-1)
  }


  const handleInputChange = (value: string) => {
    setNewMessage(value)

    // Vérifier si c'est une commande /gif
    if (value.startsWith('/gif ')) {
      const searchTerm = value.substring(5).trim()
      setGiphySearchTerm(searchTerm)

      // Débounce pour éviter trop de requêtes
      const debounceTimer = setTimeout(() => {
        searchGiphy(searchTerm)
      }, 1000)

      return () => clearTimeout(debounceTimer)
    } else {
      setGiphyResults([])
    }

    // Gérer les suggestions de mentions (@pseudo)
    handleMentionSuggestions(value)

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
        'mp',
        'player',
        'customVote',
      ].includes(command) &&
      !hasAdditionalArgs
    ) {
      const searchQuery = arg.toLowerCase()
      const filteredSuggestions =
        players
          ?.filter((p) => p.nickname.toLowerCase().includes(searchQuery) && p.id !== playerId)
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

  const handleMentionSelection = (nickname: string) => {
    // Trouver la position du dernier @ pour remplacer le texte
    const lastAtIndex = newMessage.lastIndexOf('@')
    if (lastAtIndex === -1) return

    // Extraire le texte après le @ jusqu'au prochain espace ou fin de chaîne
    const textAfterAt = newMessage.slice(lastAtIndex + 1)
    const nextSpaceIndex = textAfterAt.indexOf(' ')

    // Calculer où se termine le texte à remplacer
    const endIndex = nextSpaceIndex === -1 ? newMessage.length : lastAtIndex + 1 + nextSpaceIndex

    // Construire le nouveau message avec la mention
    const newMessageText = newMessage.substring(0, lastAtIndex) + `@${nickname}` + newMessage.substring(endIndex)

    setNewMessage(newMessageText)
    setMentionSuggestions([])
    inputRef.current?.focus()
  }

  const handleGiphySelection = (gifUrl: string) => {
    setNewMessage(`/img ${gifUrl}`)
    setGiphyResults([])
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

        <GameRule gameType={gameType} />
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
                if (mentionSuggestions.length > 0) {
                  if (e.key === 'ArrowDown') {
                    setMentionIndex((prev) => (prev + 1) % mentionSuggestions.length)
                    e.preventDefault()
                  } else if (e.key === 'ArrowUp') {
                    setMentionIndex((prev) => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length)
                    e.preventDefault()
                  } else if (e.key === 'Enter' || e.key === 'Tab') {
                    if (mentionIndex >= 0) {
                      handleMentionSelection(mentionSuggestions[mentionIndex])
                    } else if (mentionSuggestions.length > 0) {
                      handleMentionSelection(mentionSuggestions[0])
                    }
                    e.preventDefault()
                  } else if (e.key === 'Escape') {
                    setMentionSuggestions([])
                  }
                } else if (suggestions.length > 0) {
                  if (e.key === 'ArrowDown') {
                    setSelectedIndex((prev) => (prev + 1) % suggestions.length)
                    e.preventDefault()
                  } else if (e.key === 'ArrowUp') {
                    setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
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
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="bg-blue-700 hover:bg-blue-800 text-white px-3 border-t border-b border-blue-500/30 transition-colors"
              title="Ajouter un emoji"
            >
              <span className="text-xl mt-2">😀</span>
            </button>
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
          {/* Suggestions de mentions */}
          {mentionSuggestions.length > 0 && (
            <div className="sound-tick absolute bottom-full left-0 w-full bg-black/80 border border-blue-500/30 rounded-t-lg max-h-40 overflow-y-auto z-10">
              <div className="text-xs text-blue-300 px-4 py-1 border-b border-blue-500/20">Mentions</div>
              {mentionSuggestions.map((nickname, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 cursor-pointer ${
                    mentionIndex === index ? 'bg-blue-900/50' : 'hover:bg-blue-900/30'
                  }`}
                  onClick={() => handleMentionSelection(nickname)}
                >
                  {nickname}
                </div>
              ))}
            </div>
          )}
          {giphyResults.length > 0 && (
            <div className="absolute bottom-full left-0 w-full bg-black/90 border border-blue-500/30 rounded-t-lg p-2 z-10">
              <div className="text-xs text-blue-300 mb-2">
                {isSearchingGifs
                  ? 'Recherche de GIFs...'
                  : `GIFs pour "${giphySearchTerm}" (cliquez pour sélectionner)`}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {giphyResults.map((gif) => (
                  <div
                    key={gif.id}
                    className="cursor-pointer hover:opacity-80 transition-opacity border border-blue-500/20 rounded overflow-hidden"
                    onClick={() => handleGiphySelection(gif.images.fixed_height_small.url)}
                  >
                    <img
                      src={gif.images.fixed_height_small.url || '/placeholder.svg'}
                      alt="GIF"
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sélecteur d'emoji */}
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 w-80 bg-black/90 border border-blue-500/30 rounded-lg p-2 z-20 max-h-80 overflow-y-auto">
              {/* Section Emotes */}
              <div>
                <div className="text-xs text-blue-300 mb-2 pb-1 border-b border-blue-500/20">Emotes</div>
                <div className="grid grid-cols-4 gap-2">
                  {emotes.map((emote, index) => (
                    <button
                      key={index}
                      className="hover:bg-blue-900/30 rounded p-1 transition-colors flex flex-col items-center"
                      onClick={() => handleEmoteSelect(emote.code)}
                      title={`${emote.name} ${emote.code}`}
                    >
                      <img
                        src={emote.path || '/placeholder.svg'}
                        alt={emote.name}
                        className="w-5 h-5 object-contain"
                      />
                    </button>
                  ))}
                </div>

                {/* Section Emojis */}
                <div className="mb-4">
                  <div className="text-xs text-blue-300 mb-2 pb-1 border-b border-blue-500/20">Emojis</div>
                  <div className="grid grid-cols-5 gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        className="text-xl hover:bg-blue-900/30 rounded p-1 transition-colors"
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default Chat
