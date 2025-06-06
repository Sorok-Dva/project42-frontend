import React, { FC, useEffect, useState } from 'react'
import { transferCreatorRights } from 'services/gameService'
import { createPortal } from 'react-dom'
import { useAuth } from 'contexts/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { Player } from 'types/room'

interface TransferLeadModalProps {
  roomId: number
  creator: string
  players: Player[]
  onClose: () => void
}

const TransferLeadModal: FC<TransferLeadModalProps> = ({ roomId, creator, players, onClose }) => {
  const { token } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const transferLead = async (player: string) => {
    try {
      if (!token) return
      const response = await transferCreatorRights(String(roomId), player, token)
      onClose()
    } catch (e) {
      if (axios.isAxiosError(error)) {
        const errorData = await error?.response?.data
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((error : { msg : string }) => {
            setError(error.msg)
            toast.error(error.msg, ToastDefaultOptions)
          })
        } else if (errorData.error) {
          setError(errorData.error)
          toast.error(errorData.error, ToastDefaultOptions)
        }
      } else {
        setError('Une erreur est survenue.')
      }
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

  const modalContent = (
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
            { players.map((player: Player) => player.nickname !== creator ? (
              <div key={player.nickname} className="player_select_option sound-tick" onClick={() => transferLead(player.nickname)}>
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

  return mounted && typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}

export default TransferLeadModal
