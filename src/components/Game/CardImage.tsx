import React from 'react'
import { Box } from '@mui/material'

const CardImage = React.memo(function CardImage({ cardId, isArchive = false }: { cardId?: number, isArchive?: boolean}) {
  return (
    <Box id={`card_wrapper${isArchive ? '_archive' : ''}`} className="card_animation">
      <Box id="card_flipper" className="card_animation">
        <img
          className="card_role"
          src={`/assets/images/carte${cardId}.png`}
          alt="Carte"
        />
        <img
          className="card_anon"
          src="/assets/images/carte0.png"
          alt="Carte anonyme"
        />
      </Box>
    </Box>
  )
})

CardImage.displayName = 'CardImage'

export default CardImage
