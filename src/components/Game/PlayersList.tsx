import React from 'react'
import { Socket } from 'socket.io-client'
import ViewersList from 'components/Game/ViewersList'
import { Viewer } from 'hooks/useGame'
import { Tooltip } from 'react-tooltip'
import { faHeart, faUserAstronaut } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Box } from '@mui/material'

interface Player {
  nickname: string
  ready: boolean
  alive: boolean
  cardId?: number
  target?: string
  inLove: boolean
  isCharmed: boolean
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
  coupleList: string[]
  isNight: boolean
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
  coupleList,
  isNight,
}) => {
  const handleKickPlayer = (nickname: string) => {
    if (!isCreator || !socket || gameStarted) return
    try {
      console.log('Kicking player:', nickname)
      socket.emit('kickPlayer', {
        roomId: gameId,
        nickname,
      })
    } catch (error) {
      console.error('Erreur lors du kick:', error)
    }
  }

  const voteCounts: Record<string, number> = players.reduce((acc, _player) => {
    if (_player.target) {
      acc[_player.target] = (acc[_player.target] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const maxVotes = () : number => {
    return Object.values(voteCounts).reduce((max, count) => Math.max(max, count), 0)
  }

  return (
    <div id="block_players" className="block shadow bglightblue rounded">
      <div className="block_header">
        <h3>Liste des joueurs</h3>
      </div>
      <div className="block_content block_scrollable_wrapper scrollbar-light">
        <div className="block_scrollable_content">
          <div className="list_players">
            { gameStarted && (
              <strong>{ players.filter(p => p.alive).length }/{ players.length } joueurs en vie</strong>
            )}
            { players.map((_player, index) => {
              const mostVotes = (voteCounts[_player.nickname] === maxVotes()) ? ' most-voted' : ''
              return (
                <div
                  className={ `list_player ${ !_player.alive ? 'player_dead': '' }` }
                  key={ index }
                >
                  {(gameStarted && !_player.alive) || gameFinished ? (
                    <img
                      className="suspicious_card disabled"
                      src={`/assets/images/carte${_player.cardId}.png`}
                    />
                  ) : _player.cardId === 13 ? (
                    <img
                      className="suspicious_card disabled"
                      src={`/assets/images/carte${_player.cardId}.png`}
                    />
                  ) : (gameStarted && _player.alive && !gameFinished) ? (
                    <span className={`votecount clickable${mostVotes ? ' most_votes' : ''}`}>
                      {voteCounts[_player.nickname] || 0}
                    </span>
                  ) : null}
                  <span className="player sound-tick"
                    data-profile={ _player.nickname }>{ _player.nickname }</span>
                  { alienList.includes(_player.nickname) && (
                    <b className="canal_3">{ ' ' }(Alien)</b>
                  ) }

                  { (coupleList.includes(_player.nickname) || _player.inLove) && (
                    <>
                      <div className="badge-lovers"
                        data-tooltip-content={_player.inLove ? 'Ce joueur était en couple.' : 'Vous êtes un couple !'}
                        data-tooltip-id="lover"></div>
                      <Tooltip id="lover" />
                    </>
                  ) }

                  { (_player.isCharmed) && (
                    <>
                      <div className="badge-jdf"
                        data-tooltip-content={_player.nickname !== player?.nickname ? 'Ce joueur est charmé.' : 'Vous êtes charmé !'}
                        data-tooltip-id="charmed"></div>
                      <Tooltip id="charmed" />
                    </>
                  ) }

                  { (_player.cardId === 13) && (
                    <Box style={{ marginLeft: '1vh' }}>
                      <FontAwesomeIcon icon={faUserAstronaut}
                        style={{ color: '#bdbfb0', fontSize: '1.5em' }}
                        data-tooltip-content={_player.nickname !== player?.nickname ? 'Ce joueur est le Membre Loyal.' : 'Vous êtes le Membre Loyal !'}
                        data-tooltip-id="loyal" />
                      <Tooltip id="loyal" />
                    </Box>
                  ) }

                  { !isNight && _player.target && (
                    <span className="vote-for">{' '} → { _player.target }</span>
                  ) }
                  <span className="player_highlight"
                    style={ {
                      backgroundColor: highlightedPlayers[_player.nickname] || '#ccc',
                      userSelect: 'none',
                    } }
                    onClick={ () => toggleHighlightPlayer(_player.nickname) }>✏</span>
                  { !gameStarted && !gameFinished && _player.ready && (
                    <span className="player_ready" data-tooltip="Ce joueur est prêt">✔</span>
                  ) }
                  { !gameStarted
                    && !gameFinished
                    && player
                    && isCreator
                    && creatorNickname !== _player.nickname && (
                    <span className="clickable crea_kick sound-tick"
                      onClick={ () => handleKickPlayer(_player.nickname) }
                      data-tooltip="...">→</span>
                  )
                  }
                </div>
              )
            }) }
          </div>
        </div>
      </div>
      <ViewersList
        viewer={viewer ?? null}
        viewers={viewers}
      />
    </div>
  )
}

export default PlayersList
