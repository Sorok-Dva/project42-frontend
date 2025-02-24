import React, { useState } from 'react'
import { Box } from '@mui/material'
import { RoomData } from 'hooks/useGame'
import { Tooltip } from 'react-tooltip'

interface GameCompositionProps {
  roomData: RoomData
}

const GameComposition: React.FC<GameCompositionProps> = ({
  roomData,
}) => {

  // État pour stocker les infos de la carte sélectionnée
  const [selectedCard, setSelectedCard] = useState<{
    name: string
    description: string
    image?: string
  } | null>(null)

  // Gère le clic sur une carte : on met à jour l'état avec les infos
  const handleCardClick = (
    name: string,
    description: string,
    image?: string
  ) => {
    setSelectedCard({ name, description, image })
  }

  // Gère la fermeture du bloc explicatif
  const handleCloseExplicRole = () => {
    setSelectedCard(null)
  }

  return (
    <div id="block_compo" className="block bgturquoise shadow rounded">
      <div className="block_header toggle-compo"
        data-tooltip="Plier la composition">
        <h3>Composition de jeu</h3>
      </div>
      <Box className="block_content block_scrollable_wrapper scrollbar-light">
        <Box className="block_scrollable_content">
          <Box className="block_content_section">
            { roomData.cards.map((roomCard, i) => {
              const cardName = roomCard.card.name
              const cardDesc = roomCard.card.description
              const cardImg  = `/assets/images/carte${roomCard.cardId}.png`

              return (
                <React.Fragment key={i}>
                  <Box
                    className="role sound-tick"
                    data-tooltip-id={String(roomCard.card.id)}
                    data-tooltip-content={cardName}
                    onClick={() => handleCardClick(cardName, cardDesc, cardImg)}
                  >
                    { roomCard.quantity > 1 ? (
                      <>
                        <img className="carte multiple" src={cardImg} alt="" />
                        <img className="carte multiple" src={cardImg} alt="" />
                        <Box className="role_amount">
                          <span>{ roomCard.quantity }</span>
                        </Box>
                      </>
                    ) : (
                      <img className="carte" src={cardImg} alt="" />
                    )}
                  </Box>
                  <Tooltip id={String(roomCard.card.id)} />
                </React.Fragment>
              )
            })}
          </Box>
        </Box>
      </Box>

      {/* Bloc explicatif : affiché seulement si selectedCard n'est pas null */}
      {selectedCard && (
        <Box
          id="explicRole"
          className={ `block shadow rounded bglightblue ${selectedCard ? 'visible' : ''}` }
        >
          <Box>
            <Box className="close" onClick={handleCloseExplicRole}>✕</Box>
            {selectedCard.image && (
              <img src={selectedCard.image} alt="Carte" />
            )}
            <h3 className="text_center">{selectedCard.name}</h3>
            <p>{selectedCard.description}</p>
          </Box>
        </Box>
      )}
    </div>
  )
}

export default GameComposition
