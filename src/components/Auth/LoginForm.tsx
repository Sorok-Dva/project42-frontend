import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from 'contexts/UserContext'
import { toast } from 'react-toastify'
import { Button, Form, FormGroup, Input, InputGroup, InputGroupText } from 'reactstrap'
import { ToastDefaultOptions } from 'utils/toastOptions'
import axios from 'axios'

const LoginForm: React.FC<{
  toggle?: () => void
}> = ({ toggle }: { toggle?: () => void }) => {
  const { login } = useUser()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mainRef.current) {
      document.documentElement.scrollTop = 0
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0
      }
      mainRef.current.scrollTop = 0
    }
  }, [])

  const handleSubmit = async (e : React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await axios.post('/api/users/login', { username, password })

      if (response.status === 200) {
        const { data } = await response
        const token = data.token
        const payload = JSON.parse(atob(token.split('.')[1]))
        login({
          id: payload.id,
          email: payload.email,
          oldEmail: payload.oldEmail,
          nickname: payload.nickname,
          avatar: payload.avatar,
          role: payload.role,
          roleId: payload.roleId,
          isAdmin: payload.isAdmin,
          validated: payload.validated,
          lastNicknameChange: payload.lastNicknameChange,
          level: payload.level,
          title: payload.title,
          token: payload.token,
        }, token)

        toast.success(`Vous êtes maintenant connecté ! Bienvenue ${payload.nickname}.`, {
          position: 'bottom-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        })

        navigate('/')
        if (toggle) toggle()
      } else if (response.status === 400) {
        const errorData = await response.data
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((error : { msg : string }) => {
            setError(error.msg)
            toast.error(error.msg, ToastDefaultOptions)
          })
        } else if (errorData.error) {
          setError(errorData.error)
          toast.error(errorData.error, { ...ToastDefaultOptions, autoClose: 30000 })
        }
      }
    } catch (err) {
      toast.error('Une erreur est survenue.', { ...ToastDefaultOptions, autoClose: 30000 })
    }
  }
  return (
    <>
      { error &&
        <div className="alert alert-danger text-center">{ error }</div> }
      <Form role="form" onSubmit={ handleSubmit }>
        <div className="row">
          {/*<div className="col-lg-4 col-md-4 col-sm-12">
                      <a
                        href="https://www.google.com/"
                        className="default-btn mb-30"
                        target="_blank" rel="noreferrer"
                      >
                        <i className="bx bxl-google"></i> Google
                      </a>
                    </div>

                    <div className="col-lg-4 col-md-4 col-sm-12">
                      <a
                        href="https://www.facebook.com/"
                        className="default-btn mb-30"
                        target="_blank" rel="noreferrer"
                      >
                        <i className="bx bxl-facebook"></i> Facebook
                      </a>
                    </div>

                    <div className="col-lg-4 col-md-4 col-sm-12">
                      <a
                        href="https://www.twitter.com/"
                        className="default-btn mb-30"
                        target="_blank" rel="noreferrer"
                      >
                        <i className="bx bxl-twitter"></i> Twitter
                      </a>
                    </div>*/ }

          <div className="col-12">
            <FormGroup className="mb-3">
              <InputGroup
                className={ 'input-group-alternative bg-dark text-white' }>
                <InputGroupText>
                  <i className="ni ni-email-83"/>
                </InputGroupText>
                <Input
                  placeholder="Email ou pseudo"
                  type="text"
                  value={ username }
                  onChange={ (e) => setUsername(e.target.value) }
                  className={ 'bg-dark text-white' }
                />
              </InputGroup>
            </FormGroup>
          </div>

          <div className="col-12">
            <FormGroup>
              <InputGroup
                className={ 'input-group-alternative bg-dark text-white' }>
                <InputGroupText>
                  <i className="ni ni-lock-circle-open"/>
                </InputGroupText>
                <Input
                  placeholder="Mot de passe"
                  type={ showPassword ? 'text': 'password' }
                  autoComplete="off"
                  value={ password }
                  onChange={ (e) => setPassword(e.target.value) }
                  className='bg-dark text-white'
                />
                <InputGroupText>
                  <Button
                    color="secondary"
                    outline
                    onClick={ () => setShowPassword(!showPassword) }
                    className='bg-dark text-white'
                  >
                    { showPassword ? '🙈': '👁️' }
                  </Button>
                </InputGroupText>
              </InputGroup>
            </FormGroup>
          </div>

          <div className="col-12">
            <button className="default-btn btn-two text-center" type="submit">
              Connexion
            </button>
          </div>

          <div className="col-lg-6 col-sm-6 mt-2 right-item">
            <Link to="/recover-password" onClick={toggle} className="forget">
              Mot de passe oublié ?
            </Link>
          </div>

          <div className="col-12 mt-4">
            <p className="account-desc">
              Pas encore membre ?{' '}
              <Link to="/register" onClick={toggle}>S'inscrire</Link>
            </p>
          </div>
        </div>
      </Form>
    </>
  )
}

export default LoginForm
