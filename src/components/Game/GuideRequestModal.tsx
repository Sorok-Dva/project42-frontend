import React from 'react'
import { useGameContext } from 'contexts/GameContext' // Import useGameContext

// Props are no longer needed as data comes from context
// interface GuideRequestModalProps {
//   show: boolean;
//   guideNickname: string;
//   onAccept: () => void;
//   onReject: () => void;
//   onClose: () => void;
// }

const GuideRequestModal: React.FC = () => {
  const {
    guideRequests,      // Array of PlayerType, requests for the current user to be guided
    acceptGuideRequest,
    rejectGuideRequest,
    // player, // Current player, not strictly needed here as guideRequests are assumed to be for this player
  } = useGameContext()

  // Determine if the modal should be shown and get the first request
  // Assumes guideRequests in context are specifically for the current user.
  // If not, additional filtering by player.id might be needed here or in useGame.
  const activeRequest = guideRequests && guideRequests.length > 0 ? guideRequests[0] : null

  if (!activeRequest) {
    return null
  }

  const guideNickname = activeRequest.nickname // Nickname of the player wanting to be the guide

  const handleAccept = () => {
    acceptGuideRequest(activeRequest) // Pass the full PlayerType object of the requester
  }

  const handleReject = () => {
    rejectGuideRequest(activeRequest.playerId) // Pass the ID of the requester
  }

  const buttonBaseStyle: React.CSSProperties = {
    fontWeight: 'bold',
    padding: '10px 24px',
    borderRadius: '8px',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontSize: '0.9rem',
  }

  const acceptButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#38A169', // Simulates green-600
  }

  const rejectButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#E53E3E', // Simulates red-600
  }

  // The rest of the component's JSX remains the same, but uses internal handlers
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1050,
    }}>
      <div style={{
        backgroundColor: '#1A202C', // Dark background
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        width: 'auto',
        maxWidth: '400px',
        border: '1px solid #2D3748', // Dark border
      }}>
        <h3 style={{
          color: '#E2E8F0', // Light text
          marginTop: 0,
          marginBottom: '15px',
          fontSize: '1.25rem'
        }}>
          Demande de Guide
        </h3>
        <p style={{
          color: '#CBD5E0', // Lighter text for paragraph
          marginBottom: '25px',
          fontSize: '1rem'
        }}>
          <strong style={{color: '#A0AEC0'}}>{guideNickname}</strong> souhaite vous guider.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <button
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2F855A')} // Simulates green-700
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#38A169')}
            onClick={handleAccept} // Use internal handler
            style={acceptButtonStyle}
          >
            Accepter
          </button>
          <button
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#C53030')} // Simulates red-700
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#E53E3E')}
            onClick={handleReject} // Use internal handler
            style={rejectButtonStyle}
          >
            Rejeter
          </button>
        </div>
      </div>
    </div>
  )
}

export default GuideRequestModal
