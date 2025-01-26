import React from 'react'
import { List, ListItem, ListItemText, Button, Typography } from '@mui/material'
import { Socket } from 'socket.io-client'

interface Player {
  nickname: string
  ready: boolean
}

interface PlayersListProps {
  players: Player[]
  isCreator: boolean
  creatorNickname: string
  gameId: string
  socket: Socket | null
  onKick?: (nickname: string) => void
}

const PlayersList: React.FC<PlayersListProps> = ({
  players,
  isCreator,
  creatorNickname,
  gameId,
  socket,
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
        {players.map((player, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={player.nickname}
              secondary={player.ready ? 'Prêt' : 'Non prêt'}
            />
            {isCreator && creatorNickname !== player.nickname && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleKickPlayer(player.nickname)}
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
