import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useUser } from 'contexts/UserContext'
import { ToastDefaultOptions } from 'utils/toastOptions'

const Password: React.FC = () => {
  const { user } = useUser()
  const [btnDisabled, setBtnDisabled] = useState(false)

  const handlePasswordReset = async () => {
    if (!user || !user.email) {
      toast.error('L\'utilisateur n\'est pas authentifié ou l\'email est introuvable.')
      return
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      })

      if (response.ok) {
        setBtnDisabled(true)
        toast.success('Un lien de réinitialisation du mot de passe a été envoyé à votre adresse e-mail.', ToastDefaultOptions)
      } else {
        const errorData = await response.json()
        toast.error(`Erreur lors de l'envoi de l'e-mail de réinitialisation : ${errorData.error}`, ToastDefaultOptions)
      }
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation du mot de passe:', error)
      toast.error('Une erreur est survenue lors de la demande de réinitialisation du mot de passe.', ToastDefaultOptions)
    }
  }

  return (
    <>
      <p>
        Vous pouvez changer votre mot de passe à tout moment.
      </p>
      <p>
        Il vous suffit de cliquer sur le bouton, et un lien de réinitialisation du mot de passe
        vous sera envoyé par e-mail. Suivez les instructions dans l'e-mail
        pour définir un nouveau mot de passe.
      </p>

      <div className="text-center">
        <button className="button_secondary" onClick={handlePasswordReset} disabled={btnDisabled} style={{ width: '90%' }}>
          Changer mon mot de passe
        </button>
      </div>
    </>
  )
}

export default Password
