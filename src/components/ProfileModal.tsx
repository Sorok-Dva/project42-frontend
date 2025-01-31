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
  registrationDate: string;
  quote: string;
  rank: string;
  gamesPlayed: number;
  matchHistory: [{
    mode: string;
    date: string;
    result: string;
  }];
}

interface ProfileModalProps {
  nickname: string;
  onClose: () => void;
}

const ProfileModal: FC<ProfileModalProps> = ({ nickname, onClose }) => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [selfProfile, setSelfProfile] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/api/users/${nickname}`)
        setUserData(response.data.user)
        setSelfProfile(response.data.self)
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
          {error ? (
            <div className="alert alert-danger">{error}</div>
          ) : userData ? (
            <>
              <div className="profile-top">
                <div className="avatar">
                  <img src={ userData.avatar } alt="avatar"/>
                </div>
                <div className="profile-info">
                  <h3>{ nickname }</h3>
                  <div className="quote">{ userData.quote }</div>
                  <div className="profile-stats">
                    <span>Niveau <b>{ userData.level }</b></span>
                    <span><b>{ userData.gamesPlayed }</b> parties jouées</span>
                    <span><b>{ userData.points }</b> points</span>
                    <small>Inscrit le { new Date(userData.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    }) }</small>
                  </div>
                </div>
              </div>

              <div className="section-middle">
                <div className="hameau-block">
                  { selfProfile && (
                    <>
                      <p>Tu n&apos;as pas de hameau. Rejoins-en un dès
                        maintenant
                        pour faire de nouvelles rencontres !</p>
                      <button>Voir les hameaux</button>
                    </>
                  )}
                </div>
              </div>

              {/* Historique des dernières parties */ }
              <div className="match-history">
                { userData.matchHistory.map((match, idx) => (
                  <div key={ idx } className="match-row">
                    <span>{ match.mode }</span>
                    <span>{ match.date }</span>
                    <span>{ match.result }</span>
                  </div>
                )) }
              </div>

              {/* Bouton masquer/fermer ou autres actions */ }
              <div className="actions">
                <button onClick={ onClose }>Masquer les détails</button>
              </div>
            </>
          ): (
            <div
              style={ {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
              } }
            >
              <Spinner className="custom-spinner"/>
              <div style={ { marginTop: '1rem' } }>Chargement du profil...
              </div>
            </div>
          ) }
        </div>
      </div>
    </div>
  )
}

export default ProfileModal
