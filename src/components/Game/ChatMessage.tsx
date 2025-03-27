import React, { useMemo, useCallback, useRef, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import {
  AutoSizer,
  List,
  CellMeasurer,
  CellMeasurerCache,
  ListRowRenderer,
} from 'react-virtualized'
import { Message, PlayerType, Viewer } from 'hooks/useGame'

/**
 * Supprime les éventuels tags HTML d'une chaîne de caractères.
 * @param {string} input - La chaîne à nettoyer.
 * @returns {string} La chaîne sans balises HTML.
 */
function stripHTML(input: string) {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = input
  return tempDiv.textContent || tempDiv.innerText || ''
}

interface ChatMessagesProps {
  messages: Message[]
  highlightedPlayers: { [nickname: string]: string }
  player?: PlayerType
  viewer?: Viewer
  isNight: boolean
  gameFinished: boolean
  handleMentionClick: (nickname: string) => void
}

const ChatMessages: React.FC<ChatMessagesProps> = React.memo(({
  messages,
  highlightedPlayers,
  player,
  viewer,
  isNight,
  gameFinished,
  handleMentionClick,
}) => {
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      if (msg.channel === 0) return true
      if (msg.channel === 1 && viewer) return true
      if (msg.channel === 3 && player && ([2, 9, 20, 21].includes(player.card?.id || -1) || player.isInfected)) return true
      if (msg.channel === 2 && player && !player.alive) return true
      if (msg.channel === 2 && player && player.card?.id === 10 && player.alive && isNight) return true
      if (msg.channel === 3 && player && player.card?.id === 12 && player.alive && isNight) return true
      if (msg.channel === 4 && player && player.card?.id === 16 && isNight) return true
      if (msg.channel === 5 && player && player.card?.id === 17 && isNight) return true
      if (gameFinished) return true
      return false
    })
  }, [messages, player, viewer, isNight, gameFinished])

  const highlightMention = useCallback((message: string, nickname: string) => {
    if (!nickname) return message
    const regex = new RegExp(`\\b${nickname}\\b`, 'gi')
    return message.replace(regex, `<span style="background-color: #ff9100">${nickname}</span>`)
  }, [])

  // Création du cache pour les mesures (hauteur variable, largeur fixe)
  const cache = useMemo(
    () =>
      new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 30,
      }),
    []
  )

  const listRef = useRef<List>(null)

  // À chaque mise à jour des messages filtrés, défiler vers le dernier message
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToRow(filteredMessages.length - 1)
    }
  }, [filteredMessages])

  const rowRenderer: ListRowRenderer = useCallback(
    (
      { index, key, parent, style }: { index: number; key: string; parent: any; style: React.CSSProperties }
    ) => {
      const msg = filteredMessages[index]
      let cleanNickname = stripHTML(msg.nickname)

      if (msg.channel === 2 && player && player.card?.id === 10 && isNight) {
        cleanNickname = '(Anonyme)'
      }
      if (msg.channel === 3 && cleanNickname !== 'Système' && player && player.card?.id === 12 && isNight) {
        cleanNickname = '(Alien)'
      }
      const escapedMessage = stripHTML(msg.message)
      const highlightColor = cleanNickname ? (highlightedPlayers[cleanNickname] || 'transparent') : 'transparent'
      const shouldHighlight = cleanNickname !== 'Système' && cleanNickname !== 'Modération'

      let processedMessage
      if (cleanNickname === 'Modération' || cleanNickname === 'Système') {
        processedMessage = msg.message
      } else if (cleanNickname && shouldHighlight && player) {
        processedMessage = highlightMention(escapedMessage, player.nickname)
      } else {
        processedMessage = escapedMessage
      }

      return (
        <CellMeasurer
          key={key}
          cache={cache}
          parent={parent}
          columnIndex={0}
          rowIndex={index}
        >
          {({ registerChild }: { registerChild: (el: HTMLElement | null) => void }) => (
            <div ref={registerChild} style={style}>
              <Typography
                variant="body1"
                className={`canal_${msg.channel}`}
                style={{
                  backgroundColor: highlightColor,
                  padding: '4px',
                  borderRadius: '4px',
                }}
                onClick={(e) => {
                  const target = e.target as HTMLElement
                  if (target.classList.contains('msg-nickname')) {
                    const nickname = target.getAttribute('data-highlight-nickname')
                    if (nickname && handleMentionClick) {
                      handleMentionClick(nickname)
                    }
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
                        __html: cleanNickname === 'Modération' ? msg.nickname : cleanNickname,
                      }}
                    ></b>
                    {msg.channel === 1 && <>&nbsp;<span className="chat-badge-specta">Spectateur</span></>}
                    {msg.channel === 2 && <>&nbsp;<span className="chat-badge-dead">Mort</span></>}
                    {msg.channel === 3 && <>&nbsp;<span className="chat-badge-alien">Alien</span></>}
                    {msg.channel === 4 && <>&nbsp;<span className="chat-badge-sister">Soeur</span></>}
                    {msg.channel === 5 && <>&nbsp;<span className="chat-badge-brother">Frère</span></>}
                    {': '}
                  </>
                )}

                {(msg.isMeneur || msg.isPerso || msg.isMsgSite) ? (
                  <div
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
                  </div>
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: processedMessage }} />
                )}
              </Typography>
            </div>
          )}
        </CellMeasurer>
      )
    },
    [filteredMessages, highlightedPlayers, player, isNight, highlightMention, handleMentionClick, cache]
  )

  return (
    <AutoSizer>
      {({ height, width }: { height: number; width: number }) => (
        <List
          ref={listRef}
          width={width}
          height={height}
          rowCount={filteredMessages.length}
          rowHeight={cache.rowHeight}
          deferredMeasurementCache={cache}
          rowRenderer={rowRenderer}
          overscanRowCount={3}
        />
      )}
    </AutoSizer>
  )
})

ChatMessages.displayName = 'ChatMessages'

export default ChatMessages
