import React from 'react'
import { Viewer } from 'hooks/useGame'

interface ViewersListProps {
  viewers: Viewer[]
  viewer: Viewer | null
}

const ViewersList: React.FC<ViewersListProps> = ({
  viewers,
  viewer,
}) => {
  let anonymousViewers = 0

  return viewers.length > 0 && (
    <>
      <h3 className="text_center toggle-spectators">
        { viewers.length } spectateur{ viewers.length > 0 ? 's': '' }</h3>
      <div className='list_spectators'>
        { viewers.map((_viewer, index) => {
          if (!_viewer.user) anonymousViewers += 1
          return (
            <>
              {_viewer?.user?.nickname && (
                <div className='list_player'>
                  <span className='player sound-tick' data-profile={ _viewer.user.nickname }>{ _viewer.user.nickname }</span>
                </div>
              )}
            </>
          )
        }) }
        {anonymousViewers > 0 && (
          <div className='list_player'>
            <span className='player'>
              <i>{anonymousViewers} spectateur{anonymousViewers > 1 ? 's' : ''} anonyme{anonymousViewers > 1 ? 's' : ''}</i>
            </span>
          </div>
        ) }
      </div>
    </>
  )
}

export default ViewersList
