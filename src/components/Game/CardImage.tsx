import React from 'react'

interface CardImageProps {
  cardId?: number
  card?: { id: number }
  isArchive?: boolean
}

const CardImage = React.memo(function CardImage({ cardId, card, isArchive = false }: CardImageProps) {
  const finalCardId = cardId || card?.id

  if (!finalCardId) {
    return (
      <div id={`card_wrapper${isArchive ? '_archive' : ''}`} className="card_animation">
        <div className="card_flipper card_animation">
          <div className="loader"></div>
        </div>
      </div>
    )
  }

  return (
    <div id={`card_wrapper${isArchive ? '_archive' : ''}`} className="card_animation">
      <div id="card_flipper" className="card_animation">
        <img
          className="card_role absolute w-full h-full top-0 left-0 rounded-[5%] backface-hidden"
          src={`/assets/images/carte${finalCardId}.png`}
          alt="Carte"
        />
        <img
          className="card_anon absolute w-full h-full top-0 left-0 rounded-[5%] backface-hidden"
          src="/assets/images/carte0.png"
          alt="Carte anonyme"
        />
      </div>
    </div>
  )
})

CardImage.displayName = 'CardImage'

export default CardImage

