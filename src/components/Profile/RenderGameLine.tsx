import React from 'react'
import { Tooltip } from 'react-tooltip'

interface Game {
  id: string;
  name: string;
  link: string;
  type: string;
  idRole: number;
  date: string;
  meanClaps: number;
  result: string;
}

interface RenderGameLineProps {
  game: Game;
  key: string;
  wasMdj?: boolean;
  mdjLevel?: number | false;
}

const RenderGameLine: React.FC<RenderGameLineProps> = ({ game, key, wasMdj = false, mdjLevel = false }) => {
  const tooltipName = `Partie “<strong>${game.name}</strong>”`

  return (
    <li>
      <a
        className="archive-link"
        href={game.link}
        target="_blank"
        rel="noopener noreferrer"
        data-tooltip-id={`${key}_${game.id}`}
        data-tooltip-html={!wasMdj || mdjLevel ? tooltipName : undefined}
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
                      ? 'type-4'
                      : game.type === 'test'
                        ? 'type-5'
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
                data-tooltip-id="game-rating"
                data-tooltip-content={`Moyenne de claps reçus : ${game.meanClaps}/50`}
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
        ) : game.result === 'Victoire' ? (
          <b className="game-state label-win">{game.result}</b>
        ) : game.result === 'Égalité' ? (
          <b className="game-state label-draw">{game.result}</b>
        ) : (
          <b className="game-state label-lose">{game.result}</b>
        )}
      </a>
      <Tooltip id={`${key}_${game.id}`} />
    </li>
  )
}

export default RenderGameLine
