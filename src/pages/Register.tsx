'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PasswordStrengthChecker from '../components/Common/PasswordStrengthChecker'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import axios from 'axios'
import { isForbiddenNickname, isForbiddenEmail } from 'utils/forbiddenNicknames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faVenusMars,
  faKey,
  faUser,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faRocket,
  faShieldAlt,
} from '@fortawesome/free-solid-svg-icons'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [alphaKey, setAlphaKey] = useState('')
  const [gender, setGender] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isChecked, setIsChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
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

  const validateEmail = (email: string) => {
    if (isForbiddenEmail(email)) return false
    const re = /\S+@\S+\.\S+/
    return re.test(email)
  }

  const validateAlphaKey = (alphaKey: string): boolean => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return regex.test(alphaKey)
  }

  const validateUsername = (username: string) => {
    const validRegex = /^[a-zA-Z][a-z0-9]{2,9}$/
    return username.length > 3 && username.length <= 10 && !isForbiddenNickname(username) && validRegex.test(username)
  }

  const validatePassword = (password: string) => {
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
      isChecked
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!isChecked) {
      setError('Vous devez accepter les conditions générales d\'utilisation et la politique de confidentialité.')
      setIsLoading(false)
      return
    }

    try {
      await axios.post('/api/users/register', { email, password, nickname, alphaKey, isMale: gender === 'male' })

      toast.success(
        'Inscription réussie ! Veuillez vérifier votre email pour valider votre compte et finaliser la connexion.',
        ToastDefaultOptions,
      )
      navigate('/')
    } catch (err: any) {
      const errorData = err.response.data
      if (errorData.errors && Array.isArray(errorData.errors)) {
        errorData.errors.forEach((formError: { msg: string }) => {
          setError(`${error ? `${error}\n` : formError.msg}`)
          toast.error(formError.msg, ToastDefaultOptions)
        })
      } else if (errorData.error) {
        setError(errorData.error)
        toast.error(errorData.error, { ...ToastDefaultOptions, autoClose: 30000 })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePolicyClick = () => {
    setIsPolicyClicked(true)
  }

  const handleTermsClick = () => {
    setIsTermsClicked(true)
  }

  const steps = [
    { title: 'Accès Alpha', description: 'Votre clé d\'accès exclusive' },
    { title: 'Identité', description: 'Créez votre profil spatial' },
    { title: 'Sécurité', description: 'Protégez votre compte' },
    { title: 'Finalisation', description: 'Dernières étapes' },
  ]

  const getStepProgress = () => {
    let progress = 0
    if (validateAlphaKey(alphaKey)) progress += 25
    if (validateUsername(nickname) && validateEmail(email) && isGenderValid) progress += 25
    if (validatePassword(password)) progress += 25
    if (isChecked) progress += 25
    return progress
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-pink-400 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 mt-24" ref={mainRef}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4"
            >
              <FontAwesomeIcon icon={faRocket} className="text-white text-2xl" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Rejoignez l'Aventure
            </h1>
            <p className="text-gray-300 text-lg">Créez votre compte et débusquez tout les aliens infiltrés de la station Mir</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      getStepProgress() > index * 25
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs text-gray-400 mt-1 text-center">{step.title}</span>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getStepProgress()}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-black/20 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-2xl"
          >
            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center"
                >
                  <FontAwesomeIcon icon={faShieldAlt} className="mr-2" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Alpha Key */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-300">
                  <FontAwesomeIcon icon={faKey} className="mr-2 text-yellow-400" />
                  Clé Alpha
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={alphaKey}
                    onChange={(e) => setAlphaKey(e.target.value)}
                    placeholder="Entrez votre clé d'accès exclusive"
                    className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                      validateAlphaKey(alphaKey)
                        ? 'border-green-500 focus:ring-green-500/50'
                        : alphaKey
                          ? 'border-red-500 focus:ring-red-500/50'
                          : 'border-gray-700 focus:ring-blue-500/50'
                    }`}
                    required
                  />
                  {validateAlphaKey(alphaKey) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">✓</div>
                  )}
                </div>
              </motion.div>

              {/* Personal Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nickname */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-300">
                    <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-400" />
                    Pseudo
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Votre pseudo"
                      className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                        validateUsername(nickname)
                          ? 'border-green-500 focus:ring-green-500/50'
                          : nickname
                            ? 'border-red-500 focus:ring-red-500/50'
                            : 'border-gray-700 focus:ring-blue-500/50'
                      }`}
                      required
                    />
                    {validateUsername(nickname) && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">✓</div>
                    )}
                  </div>
                </motion.div>

                {/* Gender */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-300">
                    <FontAwesomeIcon icon={faVenusMars} className="mr-2 text-purple-400" />
                    Genre
                  </label>
                  <div className="relative">
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all appearance-none ${
                        isGenderValid
                          ? 'border-green-500 focus:ring-green-500/50'
                          : 'border-gray-700 focus:ring-blue-500/50'
                      }`}
                      required
                    >
                      <option value="" className="bg-gray-900">
                        Sélectionner
                      </option>
                      <option value="male" className="bg-gray-900">
                        Homme
                      </option>
                      <option value="female" className="bg-gray-900">
                        Femme
                      </option>
                      <option value="other" className="bg-gray-900">
                        Autre
                      </option>
                    </select>
                    {isGenderValid && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">✓</div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-300">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-cyan-400" />
                  Adresse Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@exemple.com"
                    className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                      validateEmail(email)
                        ? 'border-green-500 focus:ring-green-500/50'
                        : email
                          ? 'border-red-500 focus:ring-red-500/50'
                          : 'border-gray-700 focus:ring-blue-500/50'
                    }`}
                    required
                  />
                  {validateEmail(email) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">✓</div>
                  )}
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-300">
                  <FontAwesomeIcon icon={faLock} className="mr-2 text-red-400" />
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Créez un mot de passe sécurisé"
                    className={`w-full px-4 py-3 pr-12 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                      validatePassword(password)
                        ? 'border-green-500 focus:ring-green-500/50'
                        : password
                          ? 'border-red-500 focus:ring-red-500/50'
                          : 'border-gray-700 focus:ring-blue-500/50'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </motion.div>

              {/* Password Strength */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <PasswordStrengthChecker password={password} />
                </motion.div>
              )}

              {/* Terms and Conditions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="flex items-start space-x-3"
              >
                <input
                  id="terms"
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
                  J'accepte{' '}
                  <Link
                    to="/privacy"
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 transition-colors underline"
                    onClick={handlePolicyClick}
                  >
                    la Politique de confidentialité
                  </Link>{' '}
                  et{' '}
                  <Link
                    to="/terms-of-service"
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 transition-colors underline"
                    onClick={handleTermsClick}
                  >
                    les Conditions Générales d'Utilisation
                  </Link>
                </label>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!isFormValid() || isLoading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Inscription en cours...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faRocket} />
                      <span>Rejoindre l'Aventure</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="text-center mt-6 pt-6 border-t border-gray-800"
            >
              <p className="text-gray-400">
                Déjà membre ?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  Se connecter
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Register
