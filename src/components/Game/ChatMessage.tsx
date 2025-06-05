import React, {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react'
import { Box, Typography } from '@mui/material'
import { Message, PlayerType, Viewer } from 'hooks/useGame'
import { emotes } from 'components/Game/Chat'

function stripHTML(input: string) {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = input
  return tempDiv.textContent || tempDiv.innerText || ''
}

function stripHTMLKeepImages(input: string): string {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = input

  const allElements = Array.from(tempDiv.querySelectorAll<HTMLElement>('*'))
  allElements.forEach(el => {
    if (el.tagName.toLowerCase() !== 'img') {
      const parent = el.parentNode!
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el)
      }
      parent.removeChild(el)
    }
  })

  return tempDiv.innerHTML
}

interface ChatMessagesProps {
  messages: Message[]
  highlightedPlayers: { [nickname: string]: string }
  player?: PlayerType
  viewer?: Viewer
  isNight: boolean
  gameFinished: boolean
  handleMentionClick: (nickname: string) => void
  isInn: boolean
  onUnreadChange: (unread: number) => void
}

export interface ChatMessagesHandle {
  scrollToBottom: () => void
}

function replaceEmotesWithImages(message: string): string {
  let processedMessage = message

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  emotes.forEach((emote) => {
    const escapedCode = escapeRegExp(emote.code)
    const regex = new RegExp(escapedCode, 'g')
    processedMessage = processedMessage.replace(
      regex,
      `<img src="${emote.path}" alt="${emote.name}" title="${emote.name}" class="inline-block align-middle" style="height: ${emote.h}px; vertical-align: middle;" />`,
    )
  })

  return processedMessage
}

const ChatMessages = forwardRef<ChatMessagesHandle, ChatMessagesProps>(
  (
    {
      messages,
      highlightedPlayers,
      player,
      viewer,
      isNight,
      gameFinished,
      handleMentionClick,
      isInn,
      onUnreadChange,
    },
    ref
  ) => {
    // Filtrer les messages selon la logique définie
    const filteredMessages = useMemo(() => {
      return messages.filter((msg) => {
        if (msg.channel === 0) return true
        if (msg.channel === 1 && viewer) return true
        if (msg.channel === 7 && player) return true
        if (
          msg.channel === 3 &&
          player &&
          ([2, 9, 20, 21].includes(player.card?.id || -1) || player.isInfected)
        )
          return true
        if (msg.channel === 2 && player && !player.alive) return true
        if (
          msg.channel === 2 &&
          player &&
          player.card?.id === 10 &&
          player.alive &&
          isNight
        )
          return true
        if (
          msg.channel === 3 &&
          player &&
          player.card?.id === 12 &&
          player.alive &&
          isNight
        )
          return true
        if (msg.channel === 4 && player && player.card?.id === 16 && isNight)
          return true
        if (msg.channel === 5 && player && player.card?.id === 17 && isNight)
          return true
        if (msg.channel === 6 && player && player.card?.id === 23) return true
        if (msg.channel === 6 && player && isInn) return true
        if (gameFinished) return true
        return false
      })
    }, [messages, player, viewer, isNight, gameFinished, isInn])

    // Référence du conteneur scrollable
    const containerRef = useRef<HTMLDivElement>(null)
    // Dernier nombre de messages vus (lorsque l'utilisateur était en bas)
    const lastSeenCount = useRef(filteredMessages.length)

    // Expose scrollToBottom via la ref
    useImperativeHandle(
      ref,
      () => ({
        scrollToBottom: () => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: containerRef.current.scrollHeight,
              behavior: 'smooth',
            })
            lastSeenCount.current = filteredMessages.length
            onUnreadChange(0)
          }
        },
      }),
      [filteredMessages.length, onUnreadChange]
    )

    // Fonction de vérification du scroll (retourne true si on est en bas)
    const isUserAtBottom = useCallback((): boolean => {
      if (!containerRef.current) return false
      const { scrollTop, clientHeight, scrollHeight } = containerRef.current
      const threshold = 100 // marge d'erreur
      return scrollTop + clientHeight >= scrollHeight - threshold
    }, [])

    // Lorsqu'un nouveau message arrive, attendre un court délai pour que le DOM se mette à jour,
    // puis scroller automatiquement si l'utilisateur est en bas ou mettre à jour le badge sinon.
    useEffect(() => {
      const timer = setTimeout(() => {
        if (containerRef.current) {
          if (isUserAtBottom()) {
            containerRef.current.scrollTo({
              top: containerRef.current.scrollHeight,
              behavior: 'smooth',
            })
            lastSeenCount.current = filteredMessages.length
            onUnreadChange(0)
          } else {
            onUnreadChange(filteredMessages.length - lastSeenCount.current)
          }
        }
      }, 50)
      return () => clearTimeout(timer)
    }, [filteredMessages, isUserAtBottom, onUnreadChange])

    // Gestion du scroll de l'utilisateur pour mettre à jour lastSeenCount quand il atteint le bas
    const handleScroll = useCallback(() => {
      if (containerRef.current) {
        if (isUserAtBottom()) {
          lastSeenCount.current = filteredMessages.length
          onUnreadChange(0)
        }
      }
    }, [filteredMessages.length, isUserAtBottom, onUnreadChange])

    const highlightMention = useCallback(
      (message: string, nickname: string) => {
        if (!nickname) return message
        const regex = new RegExp(`\\b${nickname}\\b`, 'gi')
        return message.replace(
          regex,
          `<span style="background-color: #ff9100">${nickname}</span>`
        )
      },
      []
    )

    return (
      <Box
        ref={containerRef}
        sx={{ height: '100%', overflowY: 'auto', p: 1 }}
        onScroll={handleScroll}
      >
        {/* Affichage des messages */}
        {filteredMessages.map((msg, index) => {
          let cleanNickname = stripHTML(msg.nickname)
          if (msg.channel === 2 && player && player.card?.id === 10 && isNight) {
            cleanNickname = '(Anonyme)'
          }
          if (
            msg.channel === 3 &&
            cleanNickname !== 'Système' &&
            player &&
            player.card?.id === 12 &&
            isNight
          ) {
            cleanNickname = '(Alien)'
          }
          const escapedMessage = stripHTMLKeepImages(msg.message)
          const highlightColor = cleanNickname
            ? highlightedPlayers[cleanNickname] || 'transparent'
            : 'transparent'
          const shouldHighlight =
            cleanNickname !== 'Système' && cleanNickname !== 'Modération'
          let processedMessage = ''
          if (cleanNickname === 'Modération' || cleanNickname === 'Système') {
            processedMessage = replaceEmotesWithImages(msg.message)
          } else if (cleanNickname && shouldHighlight && player) {
            processedMessage = replaceEmotesWithImages(highlightMention(escapedMessage, player.nickname))
          } else {
            processedMessage = replaceEmotesWithImages(escapedMessage)
          }
          const uniqueKey = `${msg.playerId}-${msg.createdAt}-${index}`
          return (
            <Typography
              key={uniqueKey}
              variant="body1"
              className={`canal_${msg.channel}
               ${cleanNickname === 'Modération' ? '!bg-red-900/20 border !border-red-500/30 rounded-lg p-2': '' }
               ${cleanNickname === 'Animation' ? '!bg-purple-900/20 border !border-purple-500/30 rounded-lg p-2': '' }
               ${msg.isPerso ? '!bg-blue-900/20 border !border-blue-500/30 rounded-lg p-2': '' }
               `}
              sx={{
                backgroundColor: highlightColor,
                borderRadius: 1,
              }}
              onClick={(e) => {
                const target = e.target as HTMLElement
                if (target.classList.contains('msg-nickname')) {
                  const nickname = target.getAttribute(
                    'data-highlight-nickname'
                  )
                  if (nickname) handleMentionClick(nickname)
                }
              }}
            >
              {cleanNickname !== 'Système' && (
                <span className="msg-date">
                  [{new Date(String(msg.createdAt)).toLocaleTimeString()}]{' '}
                </span>
              )}
              {msg.icon && !msg.isMeneur && !msg.isPerso && (
                <img
                  src={`/assets/images/${msg.icon}`}
                  className="msg-icon"
                  alt="message icon"
                />
              )}
              {cleanNickname && cleanNickname !== 'Système' && (
                <>
                  <b
                    className={`msg-nickname ${msg.cssClass}`}
                    data-highlight-nickname={cleanNickname}
                    dangerouslySetInnerHTML={{
                      __html:
                        cleanNickname === 'Modération'
                          ? msg.nickname
                          : cleanNickname,
                    }}
                  ></b>
                  {msg.channel === 1 && (
                    <>
                      &nbsp;
                      <span className="chat-badge-specta">Spectateur</span>
                    </>
                  )}
                  {msg.channel === 2 && (
                    <>
                      &nbsp;
                      <span className="chat-badge-dead">Mort</span>
                    </>
                  )}
                  {msg.channel === 3 && (
                    <>
                      &nbsp;
                      <span className="chat-badge-alien">Alien</span>
                    </>
                  )}
                  {msg.channel === 4 && (
                    <>
                      &nbsp;
                      <span className="chat-badge-sister">Soeur</span>
                    </>
                  )}
                  {msg.channel === 5 && (
                    <>
                      &nbsp;
                      <span className="chat-badge-brother">Frère</span>
                    </>
                  )}
                  {msg.channel === 6 && (
                    <>
                      &nbsp;
                      <span className="chat-badge-inn">Auberge</span>
                    </>
                  )}
                  {': '}
                </>
              )}
              {(msg.isMeneur || msg.isPerso || msg.isMsgSite) ? (
                <Box
                  className={
                    msg.isMeneur
                      ? 'canal_meneur'
                      : msg.isPerso
                        ? 'canal_perso'
                        : msg.isMsgSite
                          ? 'canal_msg_site'
                          : ''
                  }
                >
                  {msg.icon && (
                    <img
                      src={`/assets/images/${msg.icon}`}
                      className="msg-icon"
                      alt="message icon"
                    />
                  )}
                  <span dangerouslySetInnerHTML={{ __html: processedMessage }} />
                </Box>
              ) : (
                <span dangerouslySetInnerHTML={{ __html: processedMessage }} />
              )}
            </Typography>
          )
        })}
      </Box>
    )
  }
)

ChatMessages.displayName = 'ChatMessages'
export default ChatMessages
