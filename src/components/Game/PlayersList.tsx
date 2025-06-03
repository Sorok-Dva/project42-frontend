'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import type { Socket } from 'socket.io-client'
import ViewersList from 'components/Game/ViewersList'
import type { Viewer } from 'hooks/useGame'
import { Tooltip } from 'react-tooltip'
import { faUserAstronaut } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandshakeAngle } from '@fortawesome/free-solid-svg-icons'
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart'
import axios from 'axios'
import { createPortal } from 'react-dom'
import { useUser } from 'contexts/UserContext'

interface Player {
  nickname: string
  realNickname: string
  ready: boolean
  alive: boolean
  cardId?: number
  target?: string
  inLove: boolean
  isSister: boolean
  isBrother: boolean
  isCharmed: boolean
  isInfected: boolean
  customVote?: number
  id?: string | number
}

interface PlayersListProps {
  players: Player[]
  player: Player | null
  viewers: Viewer[]
  viewer: Viewer | null
  isCreator: boolean
  gameStarted: boolean
  gameFinished: boolean
  creatorNickname: string
  gameId: string
  socket: Socket | null
  onKick?: (nickname: string) => void
  toggleHighlightPlayer: (nickname: string) => void
  highlightedPlayers: { [nickname: string]: string }
  alienList: string[]
  sistersList: string[]
  brothersList: string[]
  coupleList: string[]
  isNight: boolean
  isInn: boolean
  innList: string[]
}

interface SuspiciousCard {
  playerNickname: string
  cardId: number
}

export interface GameCard {
  id: number
  name: string
}

export interface RoomCard {
  id: number
  roomId: number
  cardId: number
  quantity: number
}

export interface CardsResponse {
  gameCards: Record<number, GameCard>
  roomCards: Record<number, RoomCard>
}

const PlayersList: React.FC<PlayersListProps> = ({
  players,
  player,
  viewers,
  viewer,
  isCreator = false,
  gameStarted,
  gameFinished,
  creatorNickname,
  gameId,
  socket,
  toggleHighlightPlayer,
  highlightedPlayers,
  alienList,
  sistersList,
  brothersList,
  coupleList,
  isNight,
  isInn,
  innList,
}) => {
  const { user } = useUser()
  const [availableCards, setAvailableCards] = useState<{ id: number, name: string }[]>([])
  const [suspiciousCards, setSuspiciousCards] = useState<SuspiciousCard[]>([])
  const [showCardSelector, setShowCardSelector] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [lastVotedPlayer, setLastVotedPlayer] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Récupérer les suspicious cards depuis le localStorage au chargement
  useEffect(() => {
    if (gameId && player) {
      const retrieveRoomsCards = async () => {
        const { data } = await axios.get<CardsResponse>(`/api/games/room/${gameId}/cards`)
        const { gameCards, roomCards } = data

        const available = Object.values(roomCards)
          .filter(rc => rc.quantity > 0)
          .map(rc => ({
            id: rc.cardId,
            name: gameCards[rc.cardId].name
          }))

        setAvailableCards(available)
      }

      const saved = localStorage.getItem(`suspiciousCards_${gameId}`)
      if (saved) {
        setSuspiciousCards(JSON.parse(saved))
      }

      retrieveRoomsCards()
    }
  }, [gameId, player])

  // Sauvegarder les suspicious cards dans le localStorage
  useEffect(() => {
    if (gameId && player && suspiciousCards.length > 0) {
      localStorage.setItem(`suspiciousCards_${gameId}`, JSON.stringify(suspiciousCards))
    }
  }, [suspiciousCards, gameId, player])

  const handleKickPlayer = (nickname: string) => {
    if (!isCreator || !socket || gameStarted) return
    try {
      socket.emit('kickPlayer', {
        roomId: gameId,
        nickname,
      })
    } catch (error) {
      console.error('Erreur lors du kick:', error)
    }
  }

  const voteCounts: Record<string, number> = players.reduce(
    (acc, _player) => {
      if (_player.target) {
        acc[_player.target] = (acc[_player.target] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const maxVotes = (): number => {
    return Object.values(voteCounts).reduce((max, count) => Math.max(max, count), 0)
  }

  // Trier les joueurs: d'abord les vivants, puis les morts
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.alive && !b.alive) return -1
    if (!a.alive && b.alive) return 1
    return 0
  })

  // Gérer le clic sur une carte suspecte
  const handleSuspiciousCardClick = (nickname: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (gameFinished || !player) return

    setShowCardSelector((prev) => (prev === nickname ? null : nickname))
  }

  // Assigner une carte suspecte à un joueur
  const assignSuspiciousCard = (playerNickname: string, cardId: number) => {
    setSuspiciousCards((prev) => {
      // Filtrer les cartes existantes pour ce joueur
      const filtered = prev.filter((card) => card.playerNickname !== playerNickname)
      // Ajouter la nouvelle carte
      return [...filtered, { playerNickname, cardId }]
    })
    setShowCardSelector(null)
  }

  // Obtenir l'ID de la carte suspecte pour un joueur
  const getSuspiciousCardId = (nickname: string): number => {
    const card = suspiciousCards.find((card) => card.playerNickname === nickname)
    return card ? card.cardId : 0
  }

  const votePlayer = (_player: Player) => {
    if (!socket || !player?.alive || viewer) return
    socket.emit('phaseActionResponse', {
      roomId: gameId,
      playerId: user!.id,
      actionCard: -1,
      targetId: lastVotedPlayer === _player.id ? -1 : Number(_player.id) ?? -1,
    })
    setLastVotedPlayer(lastVotedPlayer !== _player.id ? parseInt(_player.id as string ?? -1) : null)
  }

  return (
    <div className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-blue-500/30">
        <h3 className="text-lg font-bold text-white">Liste des joueurs</h3>
      </div>

      <div className="p-4">
        {gameStarted && (
          <div className="mb-3 text-center">
            <span className="text-blue-300 text-sm">
              <strong className="text-white">{players.filter((p) => p.alive).length}</strong>/{players.length} joueurs
              en vie
            </span>
          </div>
        )}

        <div className="space-y-1 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-black/20 pr-1">
          {sortedPlayers.map((_player, index) => {
            const isHighlighted = highlightedPlayers[_player.nickname]
            const mostVotes = voteCounts[_player.nickname] === maxVotes() && maxVotes() > 0
            const isCurrentPlayer = _player.nickname === player?.nickname
            const suspiciousCardId = getSuspiciousCardId(_player.nickname)

            // Determine if the current user is a spectator and can request to guide this player
            // user from useUser() is the logged-in user.
            // viewer prop means this user is a spectator in this room.
            const isCurrentUserSpectator = !!(viewer && viewer.user && viewer.user.id === user?.id && !player);
            const canRequestGuide = isCurrentUserSpectator && !gameStarted && typeof _player.id === 'number' && user?.id !== _player.id;

            return (
              <div
                key={index}
                className={`flex items-center p-2 rounded-lg ${!_player.alive ? 'bg-red-900/20 border border-red-500/20' : isHighlighted ? '' : 'hover:bg-black/30'} transition-colors relative group`}
                style={{ backgroundColor: isHighlighted || '' }}
              >
                {/* Indicateurs de rôle et statut */}
                <div className="flex items-center absolute top-1/2 transform -translate-y-1/2">
                  {/* Carte révélée pour les morts ou fin de partie */}
                  {((gameStarted && !_player.alive) || gameFinished) && _player.cardId && (
                    <div
                      className="w-7 h-7 overflow-hidden border border-gray-700 group-hover:scale-150 transition-transform"
                      title={`Carte: ${_player.cardId}`}
                    >
                      <img
                        src={`/assets/images/carte${_player.cardId}.png`}
                        alt="Carte"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Carte suspecte pour les joueurs vivants pendant la partie */}
                  {player && gameStarted && !gameFinished && _player.alive && _player.nickname !== player.nickname && (
                    <div className="relative">
                      <img
                        className="w-7 h-7 border border-yellow-500/50 cursor-pointer hover:border-yellow-500 transition-all suspicious_card"
                        src={`/assets/images/carte${suspiciousCardId}.png`}
                        alt="Suspicious Card"
                        onClick={(e) => handleSuspiciousCardClick(_player.nickname, e)}
                        data-tooltip-content={
                          suspiciousCardId > 0
                            ? `Vous suspectez que ${_player.nickname} est ${availableCards.find((c) => c.id === suspiciousCardId)?.name || 'Inconnu'}`
                            : 'Cliquez pour marquer ce joueur avec un rôle suspecté'
                        }
                        data-tooltip-id={`suspicious_${_player.nickname}`}
                      />
                      <Tooltip id={`suspicious_${_player.nickname}`} />

                      {/* Sélecteur de cartes - Rendu directement dans le DOM */}
                      {showCardSelector === _player.nickname && mounted && (
                        createPortal(<div className="fixed inset-0 bg-transparent z-[9999]" onClick={() => setShowCardSelector(null)}>
                          <div
                            className="absolute bg-black/95 border-2 border-yellow-500/70 rounded-lg p-3 w-72 shadow-xl"
                            style={{
                              top: '50%',
                              left: '85%',
                              transform: 'translate(-50%, -85%)',
                              maxHeight: '80vh',
                              overflow: 'auto',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-sm text-yellow-400 mb-2 font-semibold">
                              Rôle suspecté pour {_player.nickname}:
                            </div>
                            <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-yellow-500/30 scrollbar-track-black/20">
                              {availableCards.length > 0 ? (
                                availableCards.map((card) => (
                                  <div
                                    key={card.id}
                                    className="cursor-pointer bg-black/60 hover:bg-yellow-900/40 rounded-md p-1 transition-colors flex flex-col items-center border border-yellow-500/30 hover:border-yellow-500/70"
                                    onClick={() => assignSuspiciousCard(_player.nickname, card.id)}
                                    data-tooltip-content={card.name}
                                    data-tooltip-id={`card_${card.id}_${_player.nickname}`}
                                  >
                                    <img
                                      src={`/assets/images/carte${card.id}.png`}
                                      alt={card.name}
                                      className="w-10 h-10 object-cover rounded-md"
                                    />
                                    <Tooltip id={`card_${card.id}_${_player.nickname}`} />
                                  </div>
                                ))
                              ) : (
                                <div className="col-span-5 text-center text-gray-400 py-4">Chargement des cartes...</div>
                              )}
                            </div>
                            <div
                              className="mt-3 text-center py-2 text-xs text-gray-400 cursor-pointer hover:text-gray-300 bg-black/40 hover:bg-black/60 rounded-md border border-yellow-500/30"
                              onClick={() => assignSuspiciousCard(_player.nickname, 0)}
                            >
                              Réinitialiser
                            </div>
                          </div>
                        </div>, document.body)
                      )}
                    </div>
                  )}

                  {/* Indicateur de vote */}
                  {gameStarted && _player.alive && !isNight && !gameFinished && (
                    <div
                      className={`w-5 h-5 cursor-pointer flex items-center justify-center rounded-full ${mostVotes ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300'} text-xs font-bold`}
                      onClick={() => votePlayer(_player)}
                    >
                      {voteCounts[_player.nickname] || 0}
                    </div>
                  )}
                </div>

                {/* Nom du joueur */}
                <div
                  className={`flex-1 ${!_player.alive ? 'text-red-300 line-through' : isCurrentPlayer ? 'text-blue-300 font-bold' : 'text-white'}
                  ${player && gameStarted && !gameFinished && _player.alive && _player.nickname !== player.nickname && !isNight ? ' ml-16' : player && gameStarted && !gameFinished && _player.alive && _player.nickname !== player.nickname ? ' ml-9' : ' ml-6'}
                  ${((gameStarted && !_player.alive) || gameFinished) && _player.cardId ? ' ml-9' : ''}
                  `}
                >
                  <span className="player sound-tick" data-profile={user?.isAdmin ? _player.realNickname || _player.nickname : _player.nickname}>
                    {_player.nickname}
                  </span>

                  {/* Badges de statut */}
                  <div className="inline-flex gap-1 ml-1">
                    {/* Carte spéciale pour le Membre Loyal */}
                    {_player.cardId === 13 && (
                      <div className="ml-1">
                        <FontAwesomeIcon
                          icon={faUserAstronaut}
                          className="text-gray-400 text-lg"
                          data-tooltip-content={
                            _player.nickname !== player?.nickname
                              ? 'Ce joueur est le Membre Loyal.'
                              : 'Vous êtes le Membre Loyal !'
                          }
                          data-tooltip-id="loyal"
                        />
                        <Tooltip id="loyal" />
                      </div>
                    )}
                    {alienList.includes(_player.nickname) && (
                      <span className="inline-block px-1 text-xs bg-orange-900/60 text-orange-300 rounded">Alien</span>
                    )}
                    {sistersList.includes(_player.nickname) && (
                      <span className="inline-block px-1 text-xs bg-purple-900/60 text-purple-300 rounded">Soeur</span>
                    )}
                    {brothersList.includes(_player.nickname) && (
                      <span className="inline-block px-1 text-xs bg-blue-900/60 text-blue-300 rounded">Frère</span>
                    )}
                    {(coupleList.includes(_player.nickname) || _player.inLove) && (
                      <>
                        <span
                          className="inline-block px-1 text-red-300"
                          data-tooltip-content={_player.inLove ? 'Ce joueur était en couple.' : 'Vous êtes en couple !'}
                          data-tooltip-id="lover"
                        >
                          <FontAwesomeIcon icon={faHeart} />
                        </span>
                        <Tooltip id="lover" />
                      </>
                    )}
                    {_player.isCharmed && (
                      <>
                        <div
                          className="badge-jdf"
                          data-tooltip-content={
                            _player.nickname !== player?.nickname ? 'Ce joueur est charmé.' : 'Vous êtes charmé !'
                          }
                          data-tooltip-id="charmed"
                        ></div>
                        <Tooltip id="charmed" />
                      </>
                    )}
                    {_player.isInfected && (
                      <>
                        <div
                          className="inline-block px-1"
                          data-tooltip-content="Ce joueur a été infecté."
                          data-tooltip-id={`${_player.nickname}_infected`}
                        >
                          <span className="inline-block px-1 text-xs bg-orange-900/60 text-orange-300 rounded">
                            Infecté
                          </span>
                        </div>
                        <Tooltip id={`${_player.nickname}_infected`} />
                      </>
                    )}
                    {innList.includes(_player.nickname) && isNight && (
                      <span className="inline-block px-1 text-xs bg-yellow-900/60 text-yellow-300 rounded">
                        Auberge
                      </span>
                    )}
                  </div>

                  {/* Indication de vote */}
                  {!isNight && _player.target && !gameFinished && (
                    <span className="text-sm text-gray-400">
                      { _player.customVote ? (
                        <img src={`/assets/images/custom/votes/${_player.customVote}.png`} className="w-20" alt=""/>
                      ) : ('→')}
                      {_player.target}
                    </span>
                  )}
                </div>

                {/* Actions sur le joueur */}
                <div className="flex items-center">
                  {canRequestGuide && (
                    <button
                      onClick={() => {
                        if (socket && _player.id !== undefined) { // Ensure _player.id is defined
                          socket.emit('request_guide_player', {
                            targetPlayerId: Number(_player.id), // Assumes _player.id is the target User ID (Player.playerId)
                            roomId: gameId,
                          });
                          console.log(`Requesting to guide player ${_player.nickname} (ID: ${_player.id}) in room ${gameId}`);
                          // Future: Add client-side feedback (e.g., disable button, toast)
                        } else {
                          console.error('Socket not available or player ID undefined to request guide');
                        }
                      }}
                      title={`Request to guide ${_player.nickname}`}
                      className="w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors mr-1"
                    >
                      <FontAwesomeIcon icon={faHandshakeAngle} className="h-3 w-3" />
                    </button>
                  )}
                  {/* Indicateur "prêt" */}
                  {!gameStarted && !gameFinished && _player.ready && (
                    <div className="text-green-400" title="Ce joueur est prêt">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Bouton de mise en évidence */}
                  <button
                    className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-blue-300 hover:text-white hover:bg-black/60 transition-colors mr-1"
                    onClick={() => toggleHighlightPlayer(_player.nickname)}
                    title="Mettre en évidence ce joueur"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>

                  {/* Bouton d'expulsion (pour le créateur) */}
                  {!gameStarted && !gameFinished && player && isCreator && creatorNickname !== _player.nickname && (
                    <button
                      className="w-6 h-6 rounded-full bg-red-900/40 flex items-center justify-center text-red-300 hover:text-white hover:bg-red-900/60 transition-colors mr-1"
                      onClick={() => handleKickPlayer(_player.nickname)}
                      data-tooltip-html={`Expulser <strong>${_player.nickname}</strong> de la partie`}
                      data-tooltip-id={`kick_${_player.nickname}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <Tooltip id={`kick_${_player.nickname}`} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Liste des spectateurs */}
      <ViewersList viewer={viewer} viewers={viewers} />
    </div>
  )
}

export default PlayersList
