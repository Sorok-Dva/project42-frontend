import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { RoomData } from 'hooks/useGame'
import { createPortal } from 'react-dom'
import { Tooltip } from 'react-tooltip'

interface GameCompositionProps {
  roomData: RoomData
}

const GameComposition: React.FC<GameCompositionProps> = ({ roomData }) => {
  // État pour stocker les infos de la carte sélectionnée
  const [selectedCard, setSelectedCard] = useState<{
    name: string
    description: string
    image?: string
  } | null>(null)

  const [mounted, setMounted] = useState(false)
  const [isFolded, setIsFolded] = useState(false)

  // Référence pour le bloc explicatif
  const explicRef = useRef<HTMLDivElement>(null)

  const toggleFold = () => {
    setIsFolded((prev) => !prev)
  }

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleCardClick = (name: string, description: string, image?: string) => {
    setSelectedCard({ name, description, image })
  }

  const handleCloseExplicRole = () => {
    setSelectedCard(null)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (explicRef.current && !explicRef.current.contains(event.target as Node)) {
        setSelectedCard(null)
      }
    }

    if (selectedCard) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedCard])

  return (
    <div className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden mb-4">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-blue-500/30 flex items-center justify-between" onClick={toggleFold}>
        <h3 className="text-lg font-bold text-white">Composition de jeu</h3>
        <motion.div className="text-xs text-blue-300 cursor-pointer" title="Plier la composition" animate={{ rotate: isFolded ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>
      </div>

      {/* Contenu */}
      <AnimatePresence>
        {!isFolded && (
          <motion.div
            className="p-4 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-black/20"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-wrap justify-center">
              {roomData.cards.map((roomCard, i) => {
                const cardName = roomCard.card.name
                const cardDesc = roomCard.card.description
                const cardImg = `/assets/images/carte${roomCard.cardId}.png`
                const isOdd = i % 2 === 0
                const cardStatus = roomCard.card.status;
                const cardStyle = {
                  filter: cardStatus === 'dead' ? 'grayscale(100%)' : 'none',
                  opacity: cardStatus === 'dead' ? 0.5 : 1,
                };

                return (
                  <motion.div
                    key={i}
                    className="relative cursor-pointer group w-16 h-16 sound-tick"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCardClick(cardName, cardDesc, cardImg)}
                    title={cardName}
                    data-tooltip-id={String(roomCard.card.id)}
                    data-tooltip-content={cardName}
                  >
                    {roomCard.quantity > 1 ? (
                      <div className="relative w-full h-full">
                        <img
                          src={cardImg || '/placeholder.svg'}
                          alt={cardName}
                          className={`cursor-pointer absolute top-0 left-0 w-full h-full object-cover rounded-md shadow-md filter drop-shadow-md transition-all duration-300
                      ${isOdd ? 'scale-[0.6] rotate-[10deg]' : 'scale-[0.6] -rotate-[10deg]'}
                      group-hover:scale-100 group-hover:rotate-0 group-hover:z-10`}
                          style={cardStyle}
                        />
                        <img
                          src={cardImg || '/placeholder.svg'}
                          alt={cardName}
                          className={`cursor-pointer absolute top-0 left-0 w-full h-full object-cover rounded-md shadow-md filter drop-shadow-md transition-all duration-300
                      ${!isOdd ? 'scale-[0.6] rotate-[10deg]' : 'scale-[0.6] -rotate-[10deg]'}
                      group-hover:opacity-0`}
                          style={cardStyle}
                        />
                        <div className="absolute z-[1] w-[18px] h-[18px] leading-[18px] top-[5px] right-[5px] rotate-45 shadow-md bg-white/75 transition-opacity duration-300 group-hover:opacity-0">
                          <span className="block -rotate-45 text-xs font-bold text-center">{roomCard.quantity}</span>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={cardImg || '/placeholder.svg'}
                        alt={cardName}
                        className={`cursor-pointer absolute top-0 left-0 w-full h-full object-cover rounded-md shadow-md filter drop-shadow-md transition-all duration-300
                    ${isOdd ? 'scale-[0.6] rotate-[10deg]' : 'scale-[0.6] -rotate-[10deg]'}
                    group-hover:scale-100 group-hover:rotate-0 group-hover:z-10`}
                          style={cardStyle}
                      />
                    )}

                    { mounted && (
                      createPortal(<Tooltip id={String(roomCard.card.id)} />, document.body)
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bloc explicatif avec Portal */}
      {mounted &&
        selectedCard &&
        createPortal(
          <AnimatePresence>
            <motion.div
              ref={explicRef}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.target === e.currentTarget && handleCloseExplicRole()}
            >
              <motion.div
                className="bg-gradient-to-r from-black/80 to-blue-900/40 backdrop-blur-md rounded-xl border border-blue-500/30 p-6 max-w-md w-full"
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white text-center w-full">{selectedCard.name}</h3>
                  <button
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black/60 transition-colors"
                    onClick={handleCloseExplicRole}
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col items-center gap-4 mb-4">
                  {selectedCard.image && (
                    <div className="relative group-hover:scale-150">
                      <img
                        src={selectedCard.image || '/placeholder.svg'}
                        alt={selectedCard.name}
                        className="w-44 h-44 object-cover rounded-md border-2 border-blue-500/50 explicRoleCard"
                      />
                      <div className="absolute inset-0 bg-blue-500/10 rounded-md explicRoleCard"></div>
                    </div>
                  )}
                  <p className="text-blue-200 text-center">{selectedCard.description}</p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )}
    </div>
  )
}

export default GameComposition

