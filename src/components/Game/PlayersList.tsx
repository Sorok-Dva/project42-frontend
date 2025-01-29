import React from 'react'
import { List, ListItem, ListItemText, Button, Typography } from '@mui/material'
import { Socket } from 'socket.io-client'

interface Player {
  nickname: string
  ready: boolean
}

interface PlayersListProps {
  players: Player[]
  player: Player | null
  isCreator: boolean
  creatorNickname: string
  gameId: string
  socket: Socket | null
  onKick?: (nickname: string) => void
  toggleHighlightPlayer: (nickname: string) => void
  highlightedPlayers: { [nickname: string]: string }
}

const PlayersList: React.FC<PlayersListProps> = ({
  players,
  player,
  isCreator = false,
  creatorNickname,
  gameId,
  socket,
  toggleHighlightPlayer,
  highlightedPlayers,
}) => {
  const handleKickPlayer = (nickname: string) => {
    if (!isCreator || !socket) return
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

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Liste des joueurs
      </Typography>
      <List>
        {players.map((_player, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={_player.nickname}
              secondary={_player.ready ? 'Prêt' : 'Non prêt'}
            />
            <button
              onClick={() => toggleHighlightPlayer(_player.nickname)}
              style={{
                marginLeft: '8px',
                padding: '4px 8px',
                backgroundColor: highlightedPlayers[_player.nickname] || '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {highlightedPlayers[_player.nickname] ? 'Désélectionner' : 'Surligner'}
            </button>
            {player && isCreator && creatorNickname !== _player.nickname && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleKickPlayer(_player.nickname)}
              >
                Kick
              </Button>
            )}
          </ListItem>
        ))}
      </List>
    </div>
  )
}

export default PlayersList
