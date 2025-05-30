'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from 'contexts/UserContext'
import { toast } from 'react-toastify'
import { Form, FormGroup, Input, InputGroup, InputGroupText } from 'reactstrap'
import { ToastDefaultOptions } from 'utils/toastOptions'
import axios from 'axios'
import { motion } from 'framer-motion'

const LoginForm: React.FC<{
  toggle?: () => void
}> = ({ toggle }: { toggle?: () => void }) => {
  const { login } = useUser()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/users/login', { username, password })

      if (response.status === 200) {
        const { data } = await response
        const token = data.token
        const payload = JSON.parse(atob(token.split('.')[1]))
        login(
          {
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
            discordId: payload.discordId,
          },
          token,
        )

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
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = await error?.response?.data
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((error: { msg: string }) => {
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {error && (
        <motion.div
          className="alert alert-danger rounded-lg border border-red-500/50 bg-red-500/10 backdrop-blur-sm text-center mb-4 p-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}

      <Form role="form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <FormGroup className="mb-0">
            <label className="text-sm font-medium mb-1 block text-gray-300">Identifiant</label>
            <InputGroup className="bg-black/30 border border-gray-700/50 rounded-lg overflow-hidden backdrop-blur-sm transition-all hover:border-blue-500/50 focus-within:border-blue-500/70 focus-within:ring focus-within:ring-blue-500/20">
              <InputGroupText className="bg-transparent border-0 text-gray-400">
                <i className="ni ni-email-83" />
              </InputGroupText>
              <Input
                placeholder="Email ou pseudo"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent border-0 text-white focus:ring-0 placeholder:text-gray-500"
                required
              />
            </InputGroup>
          </FormGroup>

          <FormGroup className="mb-0">
            <label className="text-sm font-medium mb-1 block text-gray-300">Mot de passe</label>
            <InputGroup className="bg-black/30 border border-gray-700/50 rounded-lg overflow-hidden backdrop-blur-sm transition-all hover:border-blue-500/50 focus-within:border-blue-500/70 focus-within:ring focus-within:ring-blue-500/20">
              <InputGroupText className="bg-transparent border-0 text-gray-400">
                <i className="ni ni-lock-circle-open" />
              </InputGroupText>
              <Input
                placeholder="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-0 text-white focus:ring-0 placeholder:text-gray-500"
                required
              />
              <InputGroupText
                className="bg-transparent border-0 cursor-pointer text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`ni ni-${showPassword ? 'eye-off' : 'eye'}`}></i>
              </InputGroupText>
            </InputGroup>
          </FormGroup>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 rounded-lg font-medium relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all shadow-lg hover:shadow-blue-500/25"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Connexion en cours...
              </span>
            ) : (
              'Connexion'
            )}
          </motion.button>
        </div>

        <div className="flex flex-wrap justify-between mt-4 text-sm">
          <Link to="/recover-password" onClick={toggle} className="text-blue-400 hover:text-blue-300 transition-colors">
            Mot de passe oublié ?
          </Link>

          <p className="text-gray-400">
            Pas encore membre ?{' '}
            <Link
              to="/register"
              onClick={toggle}
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </Form>
    </motion.div>
  )
}

export default LoginForm
