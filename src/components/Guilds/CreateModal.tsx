import React, { FC, useState } from 'react'
import axios from 'axios'
import {
  Button,
  Container,
  Form,
  FormGroup, Input,
  InputGroup,
  Row,
} from 'reactstrap'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { useAuth } from 'contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface CreateGuildModalProps {
  canCreate: boolean
  onClose: () => void
}

const CreateGuildModal: FC<CreateGuildModalProps> = ({ canCreate, onClose }) => {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [tag, setTag] = useState('')

  const validateName = (): boolean => {
    return name.length >= 5 && name.length <= 20
  }

  const validateTag = () => {
    const validRegex = /^[a-zA-Z]{2,5}$/
    return tag.length >= 2 && tag.length <= 5
      && validRegex.test(tag)
  }

  const isFormValid = () => {
    return (
      validateName() && validateTag()
    )
  }

  if (!canCreate) setError('Vous ne pouvez pas créer de station.')

  const handleSubmit = async (e : React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await axios.post('/api/guilds/create', { name, tag }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 201) {
        onClose()
        toast.success(`Votre station [${tag}] ${name} a été créée avec succès !`, ToastDefaultOptions)

        navigate(`/station/${tag}`)
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
            <h2>Création de station</h2>
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
        style={{ width: '400px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="text-center">Créer une station</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-content">
          <Container>
            <Row className="justify-content-center">
              <Form role="form" onSubmit={handleSubmit}>
                <FormGroup className={validateName() ? 'has-success' : 'has-danger'}>
                  <Input
                    className={`form-control ${validateName() ? 'is-valid' : 'is-invalid'} bg-dark text-white`}
                    placeholder="Nom de votre station"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </FormGroup>
                <FormGroup className={validateTag() ? 'has-success' : 'has-danger'}>
                  <InputGroup className={'input-group-alternative mb-3 bg-dark text-white}'}>
                    <Input
                      className={`form-control ${validateTag() ? 'is-valid' : 'is-invalid'} bg-dark text-white`}
                      placeholder="Tag de votre station"
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value.toUpperCase())}
                    />
                  </InputGroup>
                </FormGroup>

                <div className="text-center">
                  {error && <div className="alert alert-danger text-center">{error}</div>}
                  <Button className="button bgblue mt-4" color="primary" type="submit" disabled={!isFormValid()}>
                    Créer la station {name && tag && `[${tag}] ${name}`}
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

export default CreateGuildModal
