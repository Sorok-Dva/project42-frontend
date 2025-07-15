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
    <a
      className="flex items-center justify-between w-full px-1 hover:bg-[#182348] h-[20.5px]"
      href={game.link}
      target="_blank"
      rel="noopener noreferrer"
      data-tooltip-id={`${key}_${game.id}`}
      data-tooltip-html={!wasMdj || mdjLevel ? tooltipName : undefined}
    >
      {/* Partie gauche */}
      <div className="flex items-center gap-1 overflow-hidden">
        {!wasMdj ? (
          <img
            src={`/assets/images/miniatures/carte${game.idRole}_90_90.png`}
            alt="Carte"
            className="block w-[15px] h-[15px] mt-[2px] mr-[2px] mb-[4px] ml-[4px] shadow-none rounded-none"
          />
        ) : !mdjLevel ? (
          <div className="mdj-resume" data-tooltip={tooltipName}></div>
        ) : (
          <img
            src={`/assets/images/profile/level${mdjLevel}.svg`}
            alt="Rang MDJ"
            className="block w-[15px] h-[15px] mt-[2px] mr-[2px] mb-[4px] ml-[4px] shadow-none rounded-none"
          />
        )}

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

        <strong className="text-white text-sm w-[100px] m-0 whitespace-nowrap">
          {game.type[0].toUpperCase() + game.type.substring(1)}
        </strong>

        <span className="italic text-sm text-white w-[80px] text-center">
          {game.date}
        </span>
      </div>

      {/* Partie droite */}
      <div className="flex-shrink-0 w-[50px] text-sm text-right">
        {wasMdj ? (
          !mdjLevel ? (
            game.meanClaps !== -1 ? (
              <div
                className="relative w-full h-[15px] bg-gray-800 rounded overflow-hidden"
                data-tooltip-id="game-rating"
                data-tooltip-content={`Moyenne de claps reçus : ${game.meanClaps}/50`}
              >
                <span
                  className="absolute left-0 top-0 h-full bg-yellow-400"
                  style={{ width: `${game.meanClaps * 2}%` }}
                />
              </div>
            ) : (
              <b className="text-[#668cff] text-right"> </b>
            )
          ) : (
            <b className="text-[#668cff] text-right">MDJ</b>
          )
        ) : game.result === 'Victoire' ? (
          <b className="text-[#5fce59] text-right">{game.result}</b>
        ) : game.result === 'Égalité' ? (
          <b className="text-white text-right">{game.result}</b>
        ) : (
          <b className="text-[#cc3434] text-right">{game.result}</b>
        )}
      </div>
      <Tooltip id={`${key}_${game.id}`} />
    </a>
  )
}

export default RenderGameLine
