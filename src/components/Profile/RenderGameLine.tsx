import React from 'react'

interface Game {
  id: string;
  mode: string;
  name: string;
  link: string;
  type: string;
  idRole: number;
  date: string;
  meanClaps: number;
  state: string;
}

interface RenderGameLineProps {
  game: Game;
  wasMdj?: boolean;
  mdjLevel?: number | false;
}

const RenderGameLine: React.FC<RenderGameLineProps> = ({ game, wasMdj = false, mdjLevel = false }) => {
  const tooltipName = `Partie “<strong>${game.name}</strong>”`

  return (
    <li>
      <a
        className="archive-link"
        href={game.link}
        target="_blank"
        rel="noopener noreferrer"
        data-tooltip={!wasMdj || mdjLevel ? tooltipName : undefined}
      >
        {!wasMdj ? (
          <img
            src={`/assets/images/miniatures/carte${game.idRole}_90_90.png`}
            alt="Carte"
          />
        ) : !mdjLevel ? (
          <div className="mdj-resume" data-tooltip={tooltipName}></div>
        ) : (
          <img
            src={`/assets/images/profile/level${mdjLevel}.svg`}
            alt="Rang MDJ"
          />
        )}

        {/* Affichage du type */}
        <div
          className={`bullet-game ${
            game.type === 'normale'
              ? 'type-0'
              : game.type === 'fun'
                ? 'type-1'
                : game.type === 'sérieuse'
                  ? 'type-2'
                  : game.type === 'carnage'
                    ? 'type-3'
                    : game.type === 'panthéon'
                      ? 'type-6'
                      : game.type === 'spéciale'
                        ? 'type-9'
                        : ''
          }`}
        ></div>
        <strong>
          {game.type[0].toUpperCase()}
          {game.type.substring(1)}
        </strong>
        <span className="game-date">{game.date}</span>

        {/* Si MDJ */}
        {wasMdj ? (
          !mdjLevel ? (
            game.meanClaps !== -1 ? (
              <div
                className="star-rating"
                data-tooltip={`Moyenne de claps reçus : ${game.meanClaps}/50`}
              >
                <span
                  style={{ width: `${game.meanClaps * 2}%` }}
                  className="star-rating-score"
                ></span>
              </div>
            ) : (
              <b className="game-state label-gm"></b>
            )
          ) : (
            <b className="game-state label-gm">MDJ</b>
          )
        ) : game.state === 'Victoire' ? (
          <b className="game-state label-win">{game.state}</b>
        ) : game.state === 'Égalité' ? (
          <b className="game-state label-draw">{game.state}</b>
        ) : (
          <b className="game-state label-lose">{game.state}</b>
        )}
      </a>
    </li>
  )
}

export default RenderGameLine
