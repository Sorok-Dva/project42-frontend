import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserAlt, faLock, faTrashAlt, faMailBulk } from '@fortawesome/free-solid-svg-icons'
import Password from 'components/Auth/Settings/Password'
import Email from 'components/Auth/Settings/Email'

const calculateDaysUntilNextChange = (lastNicknameChange: Date) => {
  const sixMonthsLater = new Date(lastNicknameChange.getTime())
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6)

  const today = new Date()
  const timeDifference = sixMonthsLater.getTime() - today.getTime()
  const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24))

  return daysDifference > 0 ? daysDifference : 0
}

const hasChangedNicknameWithin7Days = (lastNicknameChange?: Date | string): boolean => {
  if (!lastNicknameChange) return false
  const changeDate = new Date(lastNicknameChange)
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
  return (Date.now() - changeDate.getTime()) <= sevenDaysInMs
}

const Settings: React.FC = () => {
  const { token } = useAuth()
  const { user, setUser } = useUser()
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [canChangeIn, setCanChangeIn] = useState<number | null>(null)

  useEffect(() => {
    if (user && user.lastNicknameChange) {
      const daysRemaining = calculateDaysUntilNextChange(new Date(user.lastNicknameChange))
      setCanChangeIn(daysRemaining)
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (user) {
      setUser({
        ...user,
        [name]: value,
      })
    }
  }

  const handleNicknameChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Utilisateur non trouvé', ToastDefaultOptions)
      return
    }

    try {
      const response = await fetch('/api/users/update-nickname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nickname: user!.nickname }),
      })

      if (response.ok) {
        const updatedUser = {
          ...user,
          nickname: user!.nickname,
          lastNicknameChange: new Date(),
        }
        setBtnDisabled(true)
        setUser(updatedUser)
        toast.success('Pseudo mis à jour avec succès !', ToastDefaultOptions)
      } else {
        const errorData = await response.json()
        toast.error(`Échec de la mise à jour du pseudo: ${errorData.error}`, ToastDefaultOptions)
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du pseudo:', error)
      toast.error('Erreur lors de la mise à jour du pseudo', ToastDefaultOptions)
    }
  }

  return (
    <div>
      {/* Modifier mon pseudo */}
      <div className="box-setting">
        <h3>
          <FontAwesomeIcon icon={faUserAlt} /> Modifier mon pseudo
        </h3>
        {hasChangedNicknameWithin7Days(user?.lastNicknameChange) && !user?.isAdmin ? (
          <>
            <p>
              ⚠️ Tu as changé ton pseudo dans les 7 derniers jours : tu peux récupérer ton ancien pseudo - mais tu ne pourras plus en choisir de nouveau avant 6 mois.
            </p>
            {user?.role !== 'User' && (
              <p>
                Tu es <strong>membre de l'équipe</strong>. N'oublie pas de communiquer ton changement de pseudo à tes <strong>responsables</strong>.
              </p>
            )}
            <button id="change-pseudo" className="button_secondary">
              Récupérer mon ancien pseudo
            </button>
          </>
        ) : (canChangeIn && canChangeIn > 0) && !user?.isAdmin ? (
          <p>
            Tu as changé ton pseudo récemment. Tu pourras le changer à nouveau dans <strong>{canChangeIn} jours</strong>.
          </p>
        ) : (
          <>
            <p>
              ⚠️ <strong>Cette action n'est disponible qu'une fois tous les 6 mois</strong>
            </p>
            {user?.role !== 'User' && (
              <p>
                Tu es <strong>membre de l'équipe</strong>. N'oublie pas de communiquer ton changement de pseudo à tes <strong>responsables</strong>.
              </p>
            )}
            <form onSubmit={ handleNicknameChange }>
              <label>
                <input
                  type="text"
                  name="nickname"
                  placeholder="Nouveau pseudo"
                  onChange={ handleInputChange }
                  required
                  disabled={ btnDisabled } />
              </label>
              <div className="text-center">
                <button id="change-email" className="button_secondary" type="submit" disabled={ btnDisabled } style={{ width: '90%' }} >
                  Mettre à jour
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* Changer de mot de passe */}
      <div className="box-setting">
        <h3>
          <FontAwesomeIcon icon={faLock} /> Changer de mot de passe
        </h3>
        <Password />
      </div>

      {/* Modifier mon email */}
      <div className="box-setting">
        <h3>
          <FontAwesomeIcon icon={faMailBulk} /> Modifier mon email
        </h3>
        <Email />
      </div>

      {/* Supprimer mon compte */}
      <div className="box-setting">
        <h3>
          <FontAwesomeIcon icon={faTrashAlt} /> Supprimer mon compte
        </h3>
        <strong>LA SUPPRESSION EST IRRÉMÉDIABLE.</strong>
        <p>Réfléchis-y à deux fois avant de supprimer ton compte :)</p>
        <label>
          Mot de passe <input type="password" id="deletePassword" />
        </label>
        <button id="delete-account" className="button_secondary">
          Effacer définitivement mon compte
        </button>
      </div>
    </div>
  )
}

export default Settings
