import axios from 'axios'
import React, { FC, useEffect, useState } from 'react'
import { Spinner } from 'reactstrap'

interface UserData {
  nickname: string;
  points: number;
  level: number;
  title: string;
  avatar: string;
}

interface ProfileModalProps {
  nickname: string;
  onClose: () => void;
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    backgroundColor: '#fff',
    padding: '2rem',
    position: 'relative',
    maxWidth: '500px',
    width: '100%'
  },
  closeBtn: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    cursor: 'pointer'
  }
}

const ProfileModal: FC<ProfileModalProps> = ({ nickname, onClose }) => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/api/users/${nickname}`)
        setUserData(response.data.user)
      } catch (e: any) {
        if (e.response?.data.error) {
          setError(e.response.data.error)
        }
        console.error('Erreur lors de la récupération des données :', e)
      }
    }

    fetchUserData()
  }, [nickname])

  /**
   * Close the modal if we click on the overlay
   */
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeBtn}>
          ⛌
        </button>
        <h2>Profil de {nickname}</h2>
        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : userData ? (
          <div>
            <p>Nom : {userData.nickname}</p>
            <p>Titre : {userData.title}</p>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
            }}
          >
            <Spinner className="custom-spinner" />
            <div style={{ marginTop: '1rem' }}>Chargement du profil...</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileModal
