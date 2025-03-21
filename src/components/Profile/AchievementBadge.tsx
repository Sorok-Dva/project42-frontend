import React from 'react'
import { Tooltip } from 'react-tooltip'

interface Achievement {
  id: string
  title: string
  description: string
  unique: boolean
  level: number
  total?: number
  nextLevelTo?: number
}

interface AchievementBadgeProps {
  achievement : Achievement
  aKey: string
  isMemory? : boolean
}

const AchievementBadge : React.FC<AchievementBadgeProps> = ({
  achievement,
  isMemory,
  aKey,
}) => {
  const memoryClass = isMemory ? 'souvenir': ''
  // Pour la tooltip, on reconstruit en HTML la représentation du badge
  const levelHtml = !achievement.unique && achievement.level > 0 ? `<div class="achievement_level">${ achievement.level }</div>`: ''
  const badgeHtmlString = `<div class="achievement_badge ${ memoryClass }">
      ${ levelHtml }
      <img src="/assets/images/pictos/${ achievement.id }.png" style="height: 20px;" alt="${ achievement.description }">
    </div>`

  // Construction du contenu HTML de la tooltip
  let tooltipHtml = `<div class="${ memoryClass }">${ badgeHtmlString }</div>
    <div class="achievement_details">
      <strong>${ achievement.title ? achievement.title : '' }</strong>
      <p><b>${ !achievement.unique ? achievement.total || '': '' }</b> ${ achievement.description }</p>`

  if (!achievement.unique) {
    if (achievement.nextLevelTo !== undefined) {
      const percent = achievement.total && achievement.nextLevelTo ? (achievement.total / achievement.nextLevelTo) * 100: 0
      tooltipHtml += `<div class="achievement_progress">
          <div class="previous_progress" style="width: ${ percent }%"></div>
        </div>
        <i>(Prochain niveau à ${ achievement.nextLevelTo })</i>`
    } else {
      tooltipHtml += '<i>(Niveau maximum atteint)</i>'
    }
  }
  tooltipHtml += '</div>'

  const tooltipId = `achievement-tooltip-${ achievement.id }`

  return (
    <>
      <div data-tooltip-id={`${aKey}_${tooltipId}`}
        data-tooltip-html={ tooltipHtml }>
        <div className={ `achievement_badge ${ memoryClass }` }>
          { !achievement.unique && achievement.level > 0 &&
            <div className="achievement_level">{ achievement.level }</div> }
          <img src={ `/assets/images/pictos/${ achievement.id }.png` }
            style={ { height: '20px' } } alt={ achievement.description }/>
        </div>
      </div>
      <Tooltip id={`${aKey}_${tooltipId}`} />
    </>
  )
}

export default AchievementBadge
