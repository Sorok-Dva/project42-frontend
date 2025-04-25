import React, { useState } from 'react'
import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'

const Email: React.FC = () => {
  const { token } = useAuth()
  const { user, setUser } = useUser()

  const [btnDisabled, setBtnDisabled] = useState(false)
  const [email, setEmail] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmail(value)
    if (user) {
      setUser({
        ...user,
        [name]: value,
        oldEmail: user.email,
      })
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/users/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: user?.email ?? email }),
      })

      if (response.ok) {
        if (user) {
          const updatedUser = {
            ...user,
            email,
            oldEmail: user!.nickname,
            validated: false,
          }
          setUser(updatedUser)
        }
        setBtnDisabled(true)
        toast.success('Email de validation envoyé, veuillez vérifier votre boîte de réception', ToastDefaultOptions)
      } else {
        const errorData = await response.json()
        toast.error(`Erreur lors de la mise à jour de l'email : ${errorData.error}`, ToastDefaultOptions)
      }
    } catch (error) {
      toast.error('Erreur lors de la requête', ToastDefaultOptions)
    }
  }

  return (
    <>
      <p>
      Une fois la modification effectuée, un e-mail de confirmation
      vous sera envoyé.
      Veuillez vérifier votre boîte de réception et suivre les
      instructions pour valider
      votre nouvelle adresse e-mail.

        { !user?.validated && (
          <div className="alert alert-danger">
              Veuillez valider votre changement d'email par le biais du lien de confirmation
              envoyé à votre ancienne adresse e-mail
          </div>
        )}
      </p>

      { user?.validated && (
        <form onSubmit={ handleEmailChange }>
          <label>
            <input type="email"
              id="email"
              name="email"
              placeholder="Nouvelle adresse e-mail"
              onChange={ handleInputChange }
              required
              disabled={ btnDisabled }/>
          </label>
          <div className="text-center">
            <button id="change-email" className="button_secondary" type="submit" disabled={ btnDisabled } style={{ width: '90%' }} >
              Mettre à jour
            </button>
          </div>
        </form>
      )}
    </>
  )
}

export default Email
