import React, { FC, useState } from 'react'
import axios from 'axios'
import {
  Button,
  Container,
  Form,
  Row,
} from 'reactstrap'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { useAuth } from 'contexts/AuthContext'
import { Guild } from 'components/Guilds/Guilds'

interface JoinGuildModalProps {
  guild: Guild | null
  onClose: () => void
}

const JoinGuildModal: FC<JoinGuildModalProps> = ({ guild, onClose }) => {
  const { token } = useAuth()

  const [error, setError] = useState<string | null>(null)
  const [motivation, setMotivation] = useState('')

  if (!guild) {
    setError('Aucune station.')
    return
  }

  const handleSubmit = async (e : React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await axios.post(`/api/guilds/${guild.id}/apply`, { motivation }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 200) {
        onClose()
        toast.success(`Votre candidature pour rejoindre [${guild.tag}] ${guild.name} a été envoyée avec succès !`, ToastDefaultOptions)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = await error?.response?.data
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((error : { msg : string }) => {
            setError(error.msg)
            toast.error(error.msg, ToastDefaultOptions)
          })
        } else if (errorData.error) {
          setError(errorData.error)
          toast.error(errorData.error, ToastDefaultOptions)
        }
      } else {
        toast.error('Une erreur est survenue.', ToastDefaultOptions)
      }
    }
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  if (error) {
    return (
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Rejoindre une station</h2>
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
      <div
        className="modal-container"
        style={{ width: '500px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="text-center">Rejoindre la station "{guild.name}"</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-content">
          <Container>
            <Row className="justify-content-center">
              <Form role="form" onSubmit={handleSubmit}>
                <textarea
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Un petit texte de motivation ? 😊"
                  className="border rounded p-2 w-full"
                  cols={40}
                  rows={4}
                />

                <div className="text-center">
                  {error && <div className="alert alert-danger text-center">{error}</div>}
                  <Button className="button bgblue mt-4" color="primary" type="submit">
                    Envoyer ma candidature !
                  </Button>
                </div>
              </Form>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  )
}

export default JoinGuildModal
