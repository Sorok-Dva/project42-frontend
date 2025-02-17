import React, { FC, useState } from 'react'

import 'styles/Modal.css'

interface EditCompoModalProps {
  onClose: () => void;
}

const EditCompoModal: FC<EditCompoModalProps> = ({ onClose }) => {
  const [error, setError] = useState<string | null>(null)

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

        </div>
      </div>
    </div>
  )
}

export default EditCompoModal
