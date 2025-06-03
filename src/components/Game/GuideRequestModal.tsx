import React from 'react'

interface GuideRequestModalProps {
  show: boolean;
  guideNickname: string;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void; // Though not used by a visible button in this version
}

const GuideRequestModal: React.FC<GuideRequestModalProps> = ({
  show,
  guideNickname,
  onAccept,
  onReject,
  // onClose // Not used by a visible button for now
}) => {
  if (!show) {
    return null
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
        backgroundColor: '#1A202C',
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        width: 'auto',
        maxWidth: '400px',
        border: '1px solid #2D3748',
      }}>
        <h3 style={{
          color: '#E2E8F0',
          marginTop: 0,
          marginBottom: '15px',
          fontSize: '1.25rem'
        }}>
          Guide Request
        </h3>
        <p style={{
          color: '#CBD5E0',
          marginBottom: '25px',
          fontSize: '1rem'
        }}>
          <strong style={{color: '#A0AEC0'}}>{guideNickname}</strong> would like to guide you.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <button
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2F855A')} // Simulates green-700
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#38A169')}
            onClick={onAccept}
            style={acceptButtonStyle}
          >
            Accept
          </button>
          <button
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#C53030')} // Simulates red-700
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#E53E3E')}
            onClick={onReject}
            style={rejectButtonStyle}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}

export default GuideRequestModal
