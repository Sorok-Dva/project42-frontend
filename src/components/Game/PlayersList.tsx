import React from 'react'
import { Socket } from 'socket.io-client'
import ViewersList from 'components/Game/ViewersList'
import { Viewer } from 'hooks/useGame'
import { Tooltip } from 'react-tooltip'
import { faUserAstronaut } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart'

interface Player {
  nickname: string
  ready: boolean
  alive: boolean
  cardId?: number
  target?: string
  inLove: boolean
  isSister: boolean
  isBrother: boolean
  isCharmed: boolean
  isInfected: boolean
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

            return (
              <div
                key={index}
                className={`flex items-center p-2 rounded-lg ${!_player.alive ? 'bg-red-900/20 border border-red-500/20' : isHighlighted ? '' : 'hover:bg-black/30'} transition-colors relative group`}
                style={{ backgroundColor: isHighlighted || '' }}
              >
                {/* Indicateurs de rôle et statut */}
                <div className="flex items-center space-x-1 absolute top-1/2 transform -translate-y-1/2">
                  {/* Carte révélée pour les morts ou fin de partie */}
                  {((gameStarted && !_player.alive) || gameFinished) && _player.cardId && (
                    <div
                      className="w-6 h-6 rounded-full overflow-hidden border border-gray-700 group-hover:scale-150 transition-transform"
                      title={`Carte: ${_player.cardId}`}
                    >
                      <img
                        src={`/assets/images/carte${_player.cardId}.png`}
                        alt="Carte"
                        className="w-full h-full"
                      />
                    </div>
                  )}

                  {/* Indicateur de vote */}
                  {gameStarted && _player.alive && !isNight && !gameFinished && (
                    <div
                      className={`w-5 h-5 flex items-center justify-center rounded-full ${mostVotes ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300'} text-xs font-bold`}
                    >
                      {voteCounts[_player.nickname] || 0}
                    </div>
                  )}
                </div>

                {/* Nom du joueur */}
                <div
                  className={`flex-1 ml-6 ${!_player.alive ? 'text-red-300 line-through' : isCurrentPlayer ? 'text-blue-300 font-bold' : 'text-white'}`}
                >
                  <span className="player sound-tick" data-profile={ _player.nickname }>{_player.nickname}</span>

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
                        <span className="inline-block px-1 text-red-300"
                          data-tooltip-content={_player.inLove ? 'Ce joueur était en couple.' : 'Vous êtes en couple !'}
                          data-tooltip-id="lover"><FontAwesomeIcon icon={faHeart}/></span>
                        <Tooltip id="lover" />
                      </>
                    )}
                    {_player.isCharmed && (
                      <>
                        <div className="badge-jdf"
                          data-tooltip-content={_player.nickname !== player?.nickname ? 'Ce joueur est charmé.' : 'Vous êtes charmé !'}
                          data-tooltip-id="charmed"></div>
                        <Tooltip id="charmed" />
                      </>
                    )}
                    {_player.isInfected && (
                      <>
                        <div className="inline-block px-1"
                          data-tooltip-content="Ce joueur a été infecté."
                          data-tooltip-id={`${_player.nickname}_infected`}>
                          <span className="inline-block px-1 text-xs bg-orange-900/60 text-orange-300 rounded">Infecté</span>
                        </div>
                        <Tooltip id={`${_player.nickname}_infected`} />

                      </>
                    )}
                    {(innList.includes(_player.nickname) && isNight) && (
                      <span className="inline-block px-1 text-xs bg-yellow-900/60 text-yellow-300 rounded">
                        Auberge
                      </span>
                    )}
                  </div>

                  {/* Indication de vote */}
                  {(!isNight && _player.target && !gameFinished) && (
                    <span className="text-sm text-gray-400">→ {_player.target}</span>
                  )}
                </div>

                {/* Actions sur le joueur */}
                <div className="flex items-center space-x-1">
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
                    className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-blue-300 hover:text-white hover:bg-black/60 transition-colors"
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
                      className="w-6 h-6 rounded-full bg-red-900/40 flex items-center justify-center text-red-300 hover:text-white hover:bg-red-900/60 transition-colors"
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

