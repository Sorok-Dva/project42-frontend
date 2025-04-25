import React from 'react'
import { User } from 'components/ProfileModal'

interface JoinGameProps {
  user: User;
  relation: string;
}

const JoinGame: React.FC<JoinGameProps> = ({ user, relation }) => {
  if (relation === 'me' || !user.activity || user.activity.state === 'none') {
    return null
  }

  const { state, gameId } = user.activity

  let content: JSX.Element | null = null

  if (state === 'ingame') {
    content = (
      <>
        <p>{user.nickname} est actuellement en jeu.</p>
        <div className="join-game-button">
          <a
            className="button_secondary"
            target="_blank"
            href={`/game/${gameId}`}
            rel="noopener noreferrer"
          >
            Observer
          </a>
        </div>
      </>
    )
  } else if (state === 'pregame') {
    content = (
      <>
        <p>{user.nickname} est sur le point de commencer une partie.</p>
        <div className="join-game-button">
          <a
            className="button_secondary"
            target="_blank"
            href={`/game/${gameId}`}
            rel="noopener noreferrer"
          >
            Observer
          </a>
          <form method="POST" action="/game/join" target="_blank">
            <input type="hidden" name="room" value={gameId} />
            <button className="button_secondary" type="submit" name="player">
              Rejoindre
            </button>
          </form>
        </div>
      </>
    )
  } else if (state === 'spectator') {
    content = (
      <>
        <p>{user.nickname} observe une partie.</p>
        <div className="join-game-button">
          <a
            className="button_secondary"
            target="_blank"
            href={`/game/${gameId}`}
            rel="noopener noreferrer"
          >
            Rejoindre {user.nickname} en spectateur
          </a>
        </div>
      </>
    )
  }

  return <div className="join-game">{content}</div>
}

export default JoinGame
