import axios from 'axios'
import React, { FC, useEffect, useState } from 'react'
import { Spinner } from 'reactstrap'

import '../styles/ProfileModal.css'

interface UserData {
  nickname: string;
  points: number;
  level: number;
  title: string;
  avatar: string;
  createdAt: Date;
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
        setUserData({
          avatar: 'https://via.placeholder.com/100', // Remplacez par votre URL
          level: 10,
          rank: 'Rang MDJ',
          gamesPlayed: 48,
          points: 10022,
          blitzPlayed: 0,
          registrationDate: '24/05/2024',
          quote: '« … »',
          matchHistory: [
            { date: '30/05/2024', mode: '•Carnage', result: 'Défaite' },
            { date: '30/05/2024', mode: '•Carnage', result: 'Égalité' },
            { date: '29/05/2024', mode: '•Carnage', result: 'Défaite' },
            { date: '29/05/2024', mode: '•Carnage', result: 'Égalité' },
          ],
          ...response.data.user,
        })
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
    <div className="modal-overlay" onClick={handleOverlayClick}>
      {/*
        Empêcher la fermeture si on clique à l’intérieur :
        (si vous le souhaitez, vous pouvez faire un check
        event.target === event.currentTarget pour fermer).
      */}
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        {/* Header avec le titre et le bouton de fermeture */}
        <div className="modal-header">
          <h2>Profil de {nickname}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Contenu principal */}
        <div className="modal-content">
          <div className="profile-top">
            {/* Avatar (cercle) */}
            <div className="avatar">
              <img src={userData.avatar} alt="avatar" />
            </div>
            <div className="profile-info">
              <h3>{nickname}</h3>
              <div className="quote">{userData.quote}</div>
              <div className="profile-stats">
                <span>Niveau {userData.level}</span>
                <span>{userData.rank}</span>
                <span>{userData.gamesPlayed} parties jouées</span>
                <span>{userData.points} points</span>
                <span>{userData.blitzPlayed} partie Blitz</span>
                <p>Inscrit le {userData.registrationDate}</p>
              </div>
            </div>
          </div>

          {/* Exemple de section pour un bouton/carte d’info */}
          <div className="section-middle">
            <div className="discord-btn">
              <span>Discord</span>
            </div>
            {/* Ex. d'un message d’incitation */}
            <div className="hameau-block">
              <p>Tu n&apos;as pas de hameau. Rejoins-en un dès maintenant pour faire de nouvelles rencontres !</p>
              <button>Voir les hameaux</button>
            </div>
          </div>

          {/* Historique des dernières parties */}
          <div className="match-history">
            {userData.matchHistory.map((match, idx) => (
              <div key={idx} className="match-row">
                <span>{match.mode}</span>
                <span>{match.date}</span>
                <span>{match.result}</span>
              </div>
            ))}
          </div>

          {/* Bouton masquer/fermer ou autres actions */}
          <div className="actions">
            <button onClick={onClose}>Masquer les détails</button>
          </div>
        </div>
      </div>
    </div>
    // <div style={styles.overlay} >
    //   <div style={styles.modal}>
    //     <button onClick={onClose} style={styles.closeBtn}>
    //       ⛌
    //     </button>
    //     <h2>Profil de {nickname}</h2>
    //     {error ? (
    //       <div className="alert alert-danger">{error}</div>
    //     ) : userData ? (
    //       <div>
    //         <p>Nom : {userData.nickname}</p>
    //         <p>Titre : {userData.title}</p>
    //       </div>
    //     ) : (
    //       <div
    //         style={{
    //           display: 'flex',
    //           flexDirection: 'column',
    //           alignItems: 'center',
    //           justifyContent: 'center',
    //           minHeight: '200px',
    //         }}
    //       >
    //         <Spinner className="custom-spinner" />
    //         <div style={{ marginTop: '1rem' }}>Chargement du profil...</div>
    //       </div>
    //     )}
    //   </div>
    // </div>
  )
}

export default ProfileModal
