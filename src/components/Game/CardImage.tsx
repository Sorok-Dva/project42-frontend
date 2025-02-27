import React from 'react'
import { Box } from '@mui/material'

const CardImage = React.memo(function CardImage({ cardId }: { cardId?: number}) {
  return (
    <Box id="card_wrapper" className="card_animation">
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
