import React, { FC, useEffect, useState } from 'react'
import { Tooltip } from 'react-tooltip'
import 'styles/Modal.css'
import axios from 'axios'
import { Card, RoomCard } from 'hooks/useGame'
import { useGameContext } from 'contexts/GameContext'

interface EditCompoModalProps {
  roomId: number
  onClose: () => void
}

const EditCompoModal: FC<EditCompoModalProps> = ({ roomId, onClose }) => {
  const [error, setError] = useState<string | null>(null)
  const [cards, setCards] = useState<Record<number, RoomCard>>({})
  const [allCards, setAllCards] = useState<Record<number, Card>>({})
  const { slots, setSlots, setRoomData } = useGameContext()

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
        setCards(prevCards => ({
          ...prevCards,
          1: {
            id: 1,
            quantity: remainingSlots,
            roomId,
            cardId: 1,
            card: allCards[1]
          }
        }))
      }
    } else if (cards[1]) {
      setCards(prevCards => {
        const updatedCards = { ...prevCards }
        delete updatedCards[1]
        return updatedCards
      })
    }

    setRoomData(prevRoomData => ({
      ...prevRoomData,
      cards: Object.values(cards)
    }))
  }, [slots, cards, allCards, roomId])

  const updateAliens = (action: 'add' | 'remove') => {
    const alienCardId = 2
    if (!allCards[alienCardId]) {
      console.error('La carte Alien n\'existe pas dans les cartes disponibles.')
      return
    }

    setCards(prevCards => {
      const newCards = { ...prevCards }

      if (action === 'add') {
        const totalCards = Object.values(newCards).reduce(
          (sum, card) => sum + (card.quantity || 0),
          0
        )
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
        action === 'add'
          ? currentAlienCard.quantity + 1
          : Math.max(0, currentAlienCard.quantity - 1)

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
    if (i === 1 || i === 2 || (cardLimit(i) > slots)) return

    let defaultValue = 1
    if (i === 16) defaultValue = 2
    if (i === 17) defaultValue = 3

    const newValue = current === 0 ? defaultValue : 0

    setCards(prevCards => ({
      ...prevCards,
      [i]: prevCards[i]
        ? { ...prevCards[i], quantity: newValue }
        : {
          id: i,
          quantity: newValue,
          roomId: roomId,
          cardId: i,
          card: allCards[i]
        }
    }))
  }

  const renderCards = (array: number[]) => {
    return array.map((i) => {
      const card = cards[i]
      let number = 0

      if (card) {
        number = card.quantity
      } else if (i === 1) {
        const manualUsedSlots = Object.entries(cards)
          .filter(([key]) => Number(key) !== 1)
          .reduce((total, [, cardData]) => total + (cardData.quantity || 0), 0)
        number = Math.max(0, slots - manualUsedSlots)
      }

      const selected = number !== 0
      const cardUnavailable = cardLimit(i) > slots

      let classNames = 'compo_edit_card '
      classNames += selected && !cardUnavailable ? 'card_selected ' : ''
      classNames += cardUnavailable ? 'card_unavailable ' : ''

      let dataTooltip = ''
      if (i === 1)
        dataTooltip = 'Le nombre de Membre d\'équipage est automatique.'

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
          data-state={number}
          className={classNames}
          {...(dataTooltip ? { 'data-tooltip-content': dataTooltip } : {})}
          data-tooltip-id={String(i)}
          onClick={() => handleCardClick(i, number)}
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
                <span className="role_amount_sv">{number}</span>
              </div>
            )}
            {i === 2 && (
              <div className="role_amount">
                <span className="role_amount_lg">{number}</span>
              </div>
            )}
          </div>
          <b>{allCards[i]?.name}</b>
          {i === 2 && (
            <div className="buttons_array small_array bglightblue">
              <div
                className="button array_clickable sound-tick sound-unselect"
                data-tooltip-id={String(i)}
                data-tooltip-content="Enlever un Alien"
                onClick={() => updateAliens('remove')}
              >–</div>
              <div
                className="button array_clickable sound-tick sound-select"
                data-tooltip-id={String(i)}
                data-tooltip-content="Ajouter un Alien"
                onClick={() => updateAliens('add')}
              >+</div>
            </div>
          )}
          <Tooltip id={String(i)} />
        </div>
      )
    })
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  if (error) {
    return (
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Modifier la composition de jeu</h2>
            <button className="close-btn" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="modal-content">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal-container"
        style={{ width: '1300px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="text-center">Modifier la composition de jeu</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-content">
          <div className="compo_row">
            <div className="compo_category">
              <h3>Aliens</h3>
              {/* @TODO make 21*/}
              {renderCards([2, 20])}
            </div>
            <div className="compo_category">
              <h3>Personnages solitaires</h3>
              {renderCards([9, 15, 19])}
            </div>
            {/*<div className="compo_category">
              <h3>Autres</h3>
              {renderCards([11])}
            </div>*/}
          </div>
          <div className="compo_category">
            <h3>Innocents</h3>
            {/* @TODO make 8*/}
            {renderCards([1, 3, 4, 5, 6, 7, 10, 12, 13, 16, 17, 22, 23])}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditCompoModal
