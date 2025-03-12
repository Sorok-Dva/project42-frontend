import React, { FC, useState } from 'react'
import 'styles/Modal.css'
import { PlayerType } from 'hooks/useGame'
import { transferCreatorRights } from 'services/gameService'

interface TransferLeadModalProps {
  roomId: number
  creator: string
  players: PlayerType[]
  onClose: () => void
}

const TransferLeadModal: FC<TransferLeadModalProps> = ({ roomId, creator, players, onClose }) => {
  const [error, setError] = useState<string | null>(null)

  const transferLead = async (player: number) => {
    try {
      const response = await transferCreatorRights(String(roomId), String(player))
      console.log(response)
      onClose()
    } catch (e) {
      console.error(e)
      setError((e as Error).message)
    }
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
            <h2>Transférer les droits du salon</h2>
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
        style={{ width: '600px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="text-center">Transférer les droits du salon</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-content">
          <div className="modal_player_select_wrapper">
            { players.map((player: PlayerType) => player.nickname !== creator ? (
              <div key={player.nickname} className="player_select_option sound-tick" onClick={() => transferLead(Number(player.id))}>
                <span>{player.nickname}</span>
              </div>
            ): null)}
            { players.length === 1 && (
              <>
              Il n'y a aucun autre joueur dans ta partie. Tu peux fermer cette pop-up.
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransferLeadModal
