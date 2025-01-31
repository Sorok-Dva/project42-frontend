import React, { FC, useEffect, useState } from 'react'

interface UserData {
  name: string;
  email: string;
  // Ajoutez les champs nécessaires
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

  useEffect(() => {
    fetch(`/api/users/${nickname}`)
      .then((res) => res.json())
      .then((data: UserData) => setUserData(data))
      .catch((err) => console.error('Erreur lors de la récupération des données :', err))
  }, [nickname])

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeBtn}>
          ⛌
        </button>
        <h2>Profil de {nickname}</h2>
        {userData ? (
          <div>
            <p>Nom : {userData.name}</p>
            <p>Email : {userData.email}</p>
            {/* Autres informations... */}
          </div>
        ) : (
          <p>Chargement...</p>
        )}
      </div>
    </div>
  )
}

export default ProfileModal
