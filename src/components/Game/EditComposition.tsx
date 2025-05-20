import React, { FC, useEffect, useState } from 'react'
import { Tooltip } from 'react-tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import type { Card, RoomCard } from 'hooks/useGame'
import { useGameContext } from 'contexts/GameContext'
import { createPortal } from 'react-dom'

interface EditCompoModalProps {
  roomId: number
  onClose: () => void
}

const EditCompoModal: FC<EditCompoModalProps> = ({ roomId, onClose }) => {
  const [error, setError] = useState<string | null>(null)
  const [cards, setCards] = useState<Record<number, RoomCard>>({})
  const [allCards, setAllCards] = useState<Record<number, Card>>({})
  const { slots, setSlots, setRoomData } = useGameContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axios.get(`/api/games/room/${roomId}/cards`)
        setCards(response.data.roomCards)
        setAllCards(response.data.gameCards)
      } catch (e: any) {
        if (e.response?.data.error) {
          setError(e.response.data.error)
        }
        console.error('Erreur lors de la récupération des cards :', e)
      }
    }
    fetchCards()
  }, [roomId])

  useEffect(() => {
    if (!allCards[1]) return // On attend que la carte avec l'id 1 soit chargée

    const manualUsedSlots = Object.entries(cards)
      .filter(([key]) => Number(key) !== 1)
      .reduce((total, [, cardData]) => total + (cardData.quantity || 0), 0)
    const remainingSlots = slots - manualUsedSlots

    if (manualUsedSlots > slots && manualUsedSlots <= 24) setSlots(manualUsedSlots)
    if (remainingSlots > 0) {
      if (!cards[1] || cards[1].quantity !== remainingSlots) {
        setCards((prevCards) => ({
          ...prevCards,
          1: {
            id: 1,
            quantity: remainingSlots,
            roomId,
            cardId: 1,
            card: allCards[1],
          },
        }))
      }
    } else if (cards[1]) {
      setCards((prevCards) => {
        const updatedCards = { ...prevCards }
        delete updatedCards[1]
        return updatedCards
      })
    }

    setRoomData((prevRoomData) => ({
      ...prevRoomData,
      cards: Object.values(cards),
    }))
  }, [slots, cards, allCards, roomId, setRoomData, setSlots])

  const updateAliens = (action: 'add' | 'remove', event: React.MouseEvent) => {
    event.stopPropagation()
    const alienCardId = 2
    if (!allCards[alienCardId]) {
      console.error('La carte Alien n\'existe pas dans les cartes disponibles.')
      return
    }

    setCards((prevCards) => {
      const newCards = { ...prevCards }

      if (action === 'add') {
        const totalCards = Object.values(newCards).reduce((sum, card) => sum + (card.quantity || 0), 0)
        if (totalCards + 1 > 24) {
          const crewCard = newCards[1]
          if (crewCard && crewCard.quantity > 0) {
            if (crewCard.quantity === 1) {
              delete newCards[1]
            } else {
              newCards[1] = { ...crewCard, quantity: crewCard.quantity - 1 }
            }
          } else {
            console.error('Le nombre total de cartes ne peut pas dépasser 24.')
            return prevCards
          }
        }
      }

      const currentAlienCard = newCards[alienCardId] || {
        id: alienCardId,
        quantity: 0,
        roomId,
        cardId: alienCardId,
        card: allCards[alienCardId],
      }

      const updatedQuantity =
        action === 'add' ? currentAlienCard.quantity + 1 : Math.max(0, currentAlienCard.quantity - 1)

      if (updatedQuantity === 0) {
        const { [alienCardId]: _, ...restCards } = newCards
        return restCards
      }

      newCards[alienCardId] = {
        ...currentAlienCard,
        quantity: updatedQuantity,
      }

      return newCards
    })
  }

  const cardLimit = (id: number) => {
    let limit = 0
    switch (id) {
    case 15:
      limit = 12
      break
    case 16:
      limit = 10
      break
    case 17:
      limit = 10
      break
    case 19:
      limit = 8
      break
    case 20:
      limit = 10
      break
    case 21:
      limit = 10
      break
    case 23:
      limit = 12
      break
    case 26:
      limit = 11
      break
    case 29:
      limit = 10
      break
    case 31:
      limit = 12
      break
    default:
      break
    }
    return limit
  }

  const handleCardClick = (i: number, current: number) => {
    if (i === 1 || i === 2 || cardLimit(i) > slots) return

    let defaultValue = 1
    if (i === 16) defaultValue = 2
    if (i === 17) defaultValue = 3

    const newValue = current === 0 ? defaultValue : 0

    setCards((prevCards) => ({
      ...prevCards,
      [i]: prevCards[i]
        ? { ...prevCards[i], quantity: newValue }
        : {
          id: i,
          quantity: newValue,
          roomId: roomId,
          cardId: i,
          card: allCards[i],
        },
    }))
  }

  const renderCards = (array: number[]) => {
    return array.map((i) => {
      const cardData = cards[i]
      const inventoryCount = cardData?.quantity ?? 0
      const cardInfo = allCards[i]
      const isDisabled = cardInfo?.disabled === true

      const selected = inventoryCount > 0
      const unavailable = cardLimit(i) > slots

      let classNames = 'compo_edit_card '
      if (selected && !unavailable && !isDisabled) classNames += 'card_selected '
      if (unavailable || isDisabled) classNames += 'card_unavailable '

      let dataTooltip = ''
      if (isDisabled) {
        dataTooltip = 'Cette carte est désactivée pour le moment.'
      } else if (unavailable) {
        dataTooltip = `Pas assez de joueurs. Il faut ${cardLimit(i)} places.`
      } else if (i === 1) {
        dataTooltip = 'Le nombre de membres d\'équipage est automatique.'
      }

      let qtecards = 1
      if (i === 1 || i === 2 || i === 16) {
        qtecards = 2
      } else if (i === 17) {
        qtecards = 3
      }

      return (
        <div
          key={i}
          data-id-card={i}
          data-state={inventoryCount}
          className={classNames}
          {...(dataTooltip
            ? {
              'data-tooltip-content': dataTooltip,
              'data-tooltip-id': `card-${i}-tooltip`
            }
            : {}
          )}
          // NE PAS binder si disabled
          onClick={() => {
            if (!isDisabled && !unavailable) {
              handleCardClick(i, inventoryCount)
            }
          }}
        >
          <div className="card_wrapper">
            {Array.from({ length: qtecards }).map((_, idx) => (
              <img key={idx} src={`/assets/images/carte${i}.png`} alt={`Carte ${i}`} />
            ))}
            {i === 16 && (
              <div className="role_amount">
                <span>2</span>
              </div>
            )}
            {i === 17 && (
              <div className="role_amount">
                <span>3</span>
              </div>
            )}
            {i === 1 && (
              <div className="role_amount">
                <span className="role_amount_sv">{inventoryCount}</span>
              </div>
            )}
            {i === 2 && (
              <div className="role_amount">
                <span className="role_amount_lg">{inventoryCount}</span>
              </div>
            )}
          </div>
          <b>{allCards[i]?.name}</b>
          {i === 2 && (
            <div className="buttons_array small_array bglightblue">
              <div
                className="button array_clickable"
                data-tooltip-id={`card-${i}-tooltip`}
                data-tooltip-content="Enlever un Alien"
                onClick={(e) => updateAliens('remove', e)}
              >–</div>
              <div
                className="button array_clickable"
                data-tooltip-id={`card-${i}-tooltip`}
                data-tooltip-content="Ajouter un Alien"
                onClick={(e) => updateAliens('add', e)}
              >+</div>
            </div>
          )}

          {/* Tooltip */}
          {dataTooltip && <Tooltip id={`card-${i}-tooltip`} />}
        </div>
      )
    })
  }

  if (error) {
    return (
      <AnimatePresence>
        <div className="modal-overlay" onClick={onClose}>
          <motion.div
            className="modal-container"
            style={{ width: '1300px' }}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="text-center">Modifier la composition de jeu</h2>
              <button className="close-btn" onClick={onClose}>
                &times;
              </button>
            </div>
            <div className="modal-content">
              <div className="alert alert-danger">{error}</div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }

  const modalContent = (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          className="modal-container"
          style={{ width: '1300px' }}
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2 className="text-center">Modifier la composition de jeu</h2>
            <button className="close-btn" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="modal-content">
            {error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <>
                <div className="compo_row">
                  <div className="compo_category">
                    <h3>Aliens</h3>
                    {renderCards([2, 20, 21])}
                  </div>
                  <div className="compo_category">
                    <h3>Personnages solitaires</h3>
                    {renderCards([9, 15, 19])}
                  </div>
                </div>
                <div className="compo_category">
                  <h3>Innocents</h3>
                  {renderCards([1, 3, 4, 5, 6, 7, 8, 10, 12, 13, 16, 17, 22, 23])}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  return mounted && typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}

export default EditCompoModal

