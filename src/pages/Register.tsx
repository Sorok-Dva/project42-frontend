import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Row,
} from 'reactstrap'
import PasswordStrengthChecker from '../components/Common/PasswordStrengthChecker'
import PageBanner from 'components/Common/PageBanner'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import axios from 'axios'
import { isForbiddenNickname, isForbiddenEmail } from 'utils/forbiddenNicknames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVenusMars } from '@fortawesome/free-solid-svg-icons'

const Register : React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [alphaKey, setAlphaKey] = useState('')
  const [gender, setGender] = useState('')
  const [showPassword] = useState(false)
  const [error, setError] = useState('')
  const [isChecked, setIsChecked] = useState(false)
  const [, setIsPolicyClicked] = useState(false)
  const [, setIsTermsClicked] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)

  const isGenderValid = gender !== ''

  useEffect(() => {
    if (mainRef.current) {
      document.documentElement.scrollTop = 0
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0
      }
      mainRef.current.scrollTop = 0
    }
  }, [])

  const validateEmail = (email : string) => {
    if (isForbiddenEmail(email)) return false
    const re = /\S+@\S+\.\S+/
    return re.test(email)
  }

  const validateAlphaKey = (alphaKey: string): boolean => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return regex.test(alphaKey)
  }

  const validateUsername = (username : string) => {
    const validRegex = /^[a-zA-Z][a-z0-9]{2,9}$/
    return username.length > 3 && username.length < 10
      && !isForbiddenNickname(username)
      && validRegex.test(username)
  }

  const validatePassword = (password : string) => {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[\W_]).{8,}$/gm
    return re.test(password)
  }

  const isFormValid = () => {
    return (
      validateUsername(nickname) &&
      validateEmail(email) &&
      validatePassword(password) &&
      validateAlphaKey(alphaKey) &&
      gender !== '' &&
      isChecked /*&&
      isPolicyClicked &&
      isTermsClicked*/
    )
  }

  const handleSubmit = async (e : React.FormEvent) => {
    e.preventDefault()

    if (!isChecked) {
      setError('Vous devez accepter les conditions générales d\'utilisation et la politique de confidentialité.')
      return
    }

    try {
      await axios.post(
        '/api/users/register',
        { email, password, nickname, alphaKey, isMale: gender === 'male' },
      )

      toast.success('Inscription réussie ! Veuillez vérifier votre email pour valider votre compte et finaliser la connexion.',
        ToastDefaultOptions)
      navigate('/')
    } catch (err: any) {
      const errorData = err.response.data
      if (errorData.errors && Array.isArray(errorData.errors)) {
        errorData.errors.forEach((formError : { msg : string }) => {
          setError(`${error ? `${error}\n` : formError.msg}`)
          toast.error(formError.msg, ToastDefaultOptions)
        })
      } else if (errorData.error) {
        setError(errorData.error)
        toast.error(errorData.error, { ...ToastDefaultOptions, autoClose: 30000 })
      }
    }
  }

  const handlePolicyClick = () => {
    setIsPolicyClicked(true)
  }

  const handleTermsClick = () => {
    setIsTermsClicked(true)
  }

  return (
    <>
      <PageBanner
        pageTitle="Inscription"
        homePageUrl="/"
        homePageText="Accueil"
        activePageText="Inscription"
      />
      <main ref={ mainRef }>
        <section className="section section-shaped section-lg">
          <Container className="pt-lg-7">
            <Row className="justify-content-center">
              <Col lg="5">
                <Card className="mt-30 shadow border-0 mb-4">
                  <CardBody className={'px-lg-5 py-lg-5 bg-dark text-white'}>
                    <div className="text-center text-muted mb-4">
                      <h1>Inscription (bêta)</h1>
                    </div>
                    <Form role="form" onSubmit={handleSubmit}>
                      <FormGroup className={validateAlphaKey(alphaKey) ? 'has-success' : 'has-danger'}>
                        <InputGroup className={'input-group-alternative mb-3 bg-dark text-white}'}>
                          <InputGroupText>
                            <i className="ni ni-key-25" />
                          </InputGroupText>
                          <Input
                            className={`form-control ${validateAlphaKey(alphaKey) ? 'is-valid' : 'is-invalid'} bg-dark text-white`}
                            placeholder="Clé Alpha"
                            type="text"
                            value={alphaKey}
                            onChange={(e) => setAlphaKey(e.target.value)}
                          />
                        </InputGroup>
                      </FormGroup>
                      <FormGroup className={validateUsername(nickname) ? 'has-success' : 'has-danger'}>
                        <InputGroup className={'input-group-alternative mb-3 bg-dark text-white}'}>
                          <InputGroupText>
                            <i className="ni ni-single-02" />
                          </InputGroupText>
                          <Input
                            className={`form-control ${validateUsername(nickname) ? 'is-valid' : 'is-invalid'} bg-dark text-white`}
                            placeholder="Pseudo"
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                          />
                        </InputGroup>
                      </FormGroup>

                      <FormGroup className={validateEmail(email) ? 'has-success' : 'has-danger'}>
                        <InputGroup className={`input-group-alternative mb-3 ${validateEmail(email) ? 'is-valid' : 'is-invalid'} bg-dark text-white`}>
                          <InputGroupText>
                            <i className="ni ni-email-83" />
                          </InputGroupText>
                          <Input
                            className={`form-control ${validateEmail(email) ? 'is-valid' : 'is-invalid'} bg-dark text-white`}
                            placeholder="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </InputGroup>
                      </FormGroup>

                      <FormGroup className={isGenderValid ? 'has-success' : 'has-danger'}>
                        <InputGroup className="input-group-alternative bg-dark text-white">
                          <InputGroupText>
                            <FontAwesomeIcon icon={faVenusMars} />
                          </InputGroupText>
                          <Input
                            type="select"
                            className={`bg-dark text-white ${isGenderValid ? 'is-valid' : 'is-invalid'}`}
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                          >
                            <option value="">Sélectionner votre genre</option>
                            <option value="male">Homme</option>
                            <option value="female">Femme</option>
                            <option value="other">Autre</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>

                      <FormGroup className={validatePassword(password) ? 'has-success' : 'has-danger'}>
                        <InputGroup className={`input-group-alternative ${validateEmail(email) ? 'is-valid' : 'is-invalid'} bg-dark text-white`}>
                          <InputGroupText>
                            <i className="ni ni-lock-circle-open" />
                          </InputGroupText>
                          <Input
                            className={`${validatePassword(password) ? 'is-valid' : 'is-invalid'} bg-dark text-white`}
                            placeholder="Mot de passe"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="off"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </InputGroup>
                      </FormGroup>

                      <PasswordStrengthChecker password={password}/>

                      <Row className="my-4">
                        <Col xs="12">
                          {/* d-flex pour aligner en ligne, align-items-center pour aligner verticalement */}
                          <div className="d-flex align-items-center">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="gridCheck"
                              name="rememberMe"
                              checked={isChecked}
                              onChange={(e) => setIsChecked(e.target.checked)}
                            />
                            {/* On fait correspondre htmlFor avec l'id du input */}
                            <label
                              className="form-check-label ms-2"
                              htmlFor="gridCheck"
                            >
                              J'accepte{' '}
                              <Link to="/privacy" target="_blank" className="text-blue" onClick={() => handlePolicyClick()}>
                                <b>la Politique de confidentialité</b>
                              </Link>
                              {' '} &{' '}
                              <Link to="/terms-of-service" target="_blank" className="text-blue" onClick={() => handleTermsClick()}>
                                <b>les Conditions Générales d'Utilisation</b>
                              </Link>
                            </label>
                          </div>
                        </Col>
                      </Row>

                      <div className="text-center">
                        {error && <div className="alert alert-danger text-center">{error}</div>}
                        <Button className="mt-4" color="primary" type="submit" disabled={!isFormValid()}>
                          S'inscrire
                        </Button>
                      </div>
                    </Form>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
    </>
  )
}

export default Register
