import React from 'react'

interface Activity {
  state: 'ingame' | 'pregame' | 'spectator' | 'none' | string;
  gameId: string;
}

interface Data {
  username: string;
  activity?: Activity;
}

interface JoinGameProps {
  data: Data;
  relation: string;
}

const JoinGame: React.FC<JoinGameProps> = ({ data, relation }) => {
  if (relation === 'me' || !data.activity || data.activity.state === 'none') {
    return null
  }

  const { state, gameId } = data.activity

  let content: JSX.Element | null = null

  if (state === 'ingame') {
    content = (
      <>
        <p>{data.username} est actuellement en jeu.</p>
        <div className="join-game-button">
          <a
            className="button_secondary"
            target="_blank"
            href={`/jeu/index.php?partie=${gameId}`}
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
        <p>{data.username} est sur le point de commencer une partie.</p>
        <div className="join-game-button">
          <a
            className="button_secondary"
            target="_blank"
            href={`/jeu/index.php?partie=${gameId}`}
            rel="noopener noreferrer"
          >
            Observer
          </a>
          <form method="POST" action="/jeu/index.php" target="_blank">
            <input type="hidden" name="salon" value={gameId} />
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
        <p>{data.username} observe une partie.</p>
        <div className="join-game-button">
          <a
            className="button_secondary"
            target="_blank"
            href={`/jeu/index.php?partie=${gameId}`}
            rel="noopener noreferrer"
          >
            Rejoindre {data.username} en spectateur
          </a>
        </div>
      </>
    )
  }

  return <div className="join-game">{content}</div>
}

export default JoinGame
