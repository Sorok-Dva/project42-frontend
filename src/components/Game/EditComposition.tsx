import React, { FC, useEffect, useState } from 'react'
import { Tooltip } from 'react-tooltip'
import 'styles/Modal.css'
import axios from 'axios'
import { Card, RoomCard } from 'hooks/useGame'

interface EditCompoModalProps {
  roomId: number
  slots: number
  onClose: () => void;
}

const EditCompoModal: FC<EditCompoModalProps> = ({ roomId, slots, onClose }) => {
  const [error, setError] = useState<string | null>(null)
  const [cards, setCards] = useState<RoomCard[]>([])
  const [allCards, setAllCards] = useState<Card[]>([])

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axios.get(`/api/games/room/${roomId}/cards`)
        const roomCardsArray = Array.isArray(response.data.roomCards)
          ? response.data.roomCards
          : Object.values(response.data.roomCards)
        const gameCardsArray = Array.isArray(response.data.gameCards)
          ? response.data.gameCards
          : Object.values(response.data.gameCards)
        setCards(roomCardsArray)
        setAllCards(gameCardsArray)
      } catch (e: any) {
        if (e.response?.data.error) {
          setError(e.response.data.error)
        }
        console.error('Erreur lors de la récupération des cards :', e)
      }
    }
    fetchCards()
  }, [roomId])


  const cardLimit = (id: number) => {
    let limite = 0
    switch (id) {
    case 15:
      limite = 12
      break
    case 19:
      limite = 8
      break
    case 20:
      limite = 10
      break
    case 21:
      limite = 10
      break
    case 22:
      limite = 10
      break
    case 26:
      limite = 11
      break
    case 29:
      limite = 10
      break
    case 31:
      limite = 12
      break
    default:
      break
    }
    return limite
  }

  const handleCardClick = (i: number, current: number) => {
    // Définir la valeur par défaut lors de la sélection
    let defaultValue = 1
    if (i === 22) defaultValue = 2
    if (i === 26) defaultValue = 3

    const newValue = current === 0 ? defaultValue : 0

    setCards(prevCards =>
      prevCards.find(card => Number(card.id) === i)
        ? prevCards.map(card =>
          Number(card.id) === i ? { ...card, quantity: newValue } : card
        )
        : [
          ...prevCards,
          {
            id: i,
            quantity: newValue,
            roomId: roomId, // On utilise la prop roomId
            cardId: i,      // On suppose que l'id de la carte est identique
            card: allCards.find(c => Number(c.id) === i)!, // On récupère les données via allCards (assurez-vous qu'elles existent)
          },
        ]
    )
  }

  const renderCards = (array: number[]) => {
    return array.map((i) => {
      const card = cards.find(card => Number(card.id) === i)
      let number = 0
      if (card && typeof card.quantity === 'number') {
        number = card.quantity
      } else if (i === 1) {
        number = slots - cards.length
      }

      const selected = number !== 0
      const cardUnavailable = cardLimit(i) > slots

      let classNames = 'compo_edit_card '
      classNames += selected ? 'card_selected ' : ''
      classNames += cardUnavailable ? 'card_unavailable ' : ''

      let dataTooltip = ''
      if (i === 1)
        dataTooltip = 'Le nombre de Membre d\'équipage est automatique.'

      let qtecards = 1
      if (i === 1 || i === 2 || i === 22) {
        qtecards = 2
      } else if (i === 26) {
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
            {i === 22 && (
              <div className="role_amount">
                <span>2</span>
              </div>
            )}
            {i === 26 && (
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
            {(i === 3 || i === 6) && (
              <div className="compo_edit_caption">
                {number !== 0 && number}
              </div>
            )}
          </div>
          <b>{allCards[i]?.name}</b>
          {i === 2 && (
            <div className="buttons_array small_array bglightblue">
              <div className="decrement_wolves button array_clickable sound-tick sound-unselect" data-tooltip="Enlever un Loup-Garou">–</div>
              <div className="increment_wolves button array_clickable sound-tick sound-select" data-tooltip="Ajouter un Loup-Garou">+</div>
            </div>
          )}
          {i === 19 && (
            <div className="buttons_array small_array bglightblue">
              <div className="decrement_angels button array_clickable sound-tick sound-unselect" data-tooltip="Enlever un Ange">–</div>
              <div className="increment_angels button array_clickable sound-tick sound-select" data-tooltip="Ajouter un Ange">+</div>
            </div>
          )}
          {i === 29 && (
            <div className="buttons_array small_array bglightblue">
              <div className="decrement_judges button array_clickable sound-tick sound-unselect" data-tooltip="Enlever un Juge">–</div>
              <div className="increment_judges button array_clickable sound-tick sound-select" data-tooltip="Ajouter un Juge">+</div>
            </div>
          )}
          <Tooltip id={String(i)} />
        </div>
      )
    })
  }

  /**
   * Close the modal if we click on the overlay
   */
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  if (error) {
    return (
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
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
      <div className="modal-container"
        style={{ width: '1300px' }}
        onClick={e => e.stopPropagation()}>
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
              {renderCards([2, 20, 21])}
            </div>
            <div className="compo_category">
              <h3>Personnages solitaires</h3>
              {renderCards([9, 15, 19, 31])}
            </div>
            <div className="compo_category">
              <h3>Autres</h3>
              {renderCards([11, 16, 25])}
            </div>
          </div>
          <div className="compo_category">
            <h3>Innocents</h3>
            {renderCards([1, 3, 4, 5, 6, 7, 8, 10, 12, 13, 14, 17, 18, 22, 23, 24, 26, 27, 28, 29, 32, 33, 34])}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditCompoModal
