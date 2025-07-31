import React from 'react'
import { Viewer } from 'hooks/useGame'
import { Player } from 'types/room'
import { Tooltip } from 'react-tooltip'

interface ViewersListProps {
  viewers: Viewer[]
  players: Player[]
  viewer: Viewer | null
}

const ViewersList: React.FC<ViewersListProps> = ({ viewers, viewer, players }) => {
  if (viewers.length === 0) return null

  let anonymousViewers = 0
  viewers.forEach((v) => {
    if (!v.user) anonymousViewers += 1
  })

  return (
    <div className="mt-4">
      <div
        className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-2 border-b border-blue-500/30 cursor-pointer"
        title="Afficher/masquer les spectateurs"
      >
        <h3 className="text-base font-medium text-center text-white">
          {viewers.length} spectateur{viewers.length > 1 ? 's' : ''}
        </h3>
      </div>

      <div className="p-3 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-black/20">
        <div className="space-y-1">
          {viewers.map((v, index) => {
            if (!v.user?.nickname) return null
            return (
              <div
                key={index}
                className="flex items-center px-2 py-1 rounded-md hover:bg-blue-900/20 transition-colors group"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="player sound-tick text-blue-200 group-hover:text-white transition-colors cursor-pointer"  data-profile={ v.user.nickname }>
                  {v.user.nickname}
                </span>
                { players.find(p => p.guide === v.user?.nickname) && (
                  <>
                    <div
                      data-tooltip-content={ `Ce spectateur guide ${players.find(p => p.guide === v.user?.nickname)?.nickname}.` }
                      data-tooltip-id={`${v.user?.nickname}_guide`}
                    >
                      <span className="inline-block px-1 text-xs bg-green-900/60 text-green-300 rounded">
                        Guide
                      </span>
                    </div>
                    <Tooltip id={`${v.user?.nickname}_guide`} />
                  </>
                )}
              </div>
            )
          })}

          {anonymousViewers > 0 && (
            <div className="px-2 py-1 text-gray-400 italic text-sm">
              {anonymousViewers} spectateur{anonymousViewers > 1 ? 's' : ''} anonyme{anonymousViewers > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ViewersList

