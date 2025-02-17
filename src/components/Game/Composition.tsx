import React from 'react'
import { Box } from '@mui/material'
import { RoomData } from 'hooks/useGame'

interface GameCompositionProps {
  roomData: RoomData
}

/**
 * Composition de jeu du salon
 */
const GameComposition: React.FC<GameCompositionProps> = ({
  roomData,
}) => {
  return (
    <div id="block_compo" className="block bgturquoise shadow rounded">
      <div className="block_header toggle-compo" data-tooltip="Plier la composition">
        <h3>Composition de jeu</h3>
      </div>
      <Box className="block_content block_scrollable_wrapper scrollbar-light">
        <Box className="block_scrollable_content">
          <Box className="block_content_section">
            { roomData.cards.map((roomCard, i) => {
              return (
                <Box
                  key={i}
                  className={'role sound-tick'}
                >
                  {roomCard.quantity > 1 ? (
                    <>
                      <img className="carte multiple" src={`/assets/images/carte${roomCard.cardId}.png`} alt="" />
                      <img className="carte multiple" src={`/assets/images/carte${roomCard.cardId}.png`} alt="" />
                      <Box className="role_amount">
                        <span>{roomCard.quantity}</span>
                      </Box>
                    </>
                  ) : (
                    <img className="carte" src={`/assets/images/carte${roomCard.cardId}.png`} alt="" />
                  )}

                  {roomCard.cardId === 30 ? (
                    <div className="role_amount bavarde">B</div>
                  ) : roomCard.cardId === 60 ? (
                    <div className="role_amount bavard">B</div>
                  ) : null}
                </Box>
              )
            }) }
          </Box>
        </Box>
      </Box>
    </div>
  )
}

export default GameComposition
