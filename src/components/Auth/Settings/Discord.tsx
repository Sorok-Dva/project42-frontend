// src/components/Auth/Discord.tsx
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUser } from 'contexts/UserContext'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { toast } from 'react-toastify'

const CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID!
const REDIRECT_URI = process.env.REACT_APP_DISCORD_REDIRECT_URI!
const SCOPE = 'identify%20email'
const AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&response_type=code&scope=${SCOPE}`

const Discord: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, setUser, login } = useUser()
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const code = params.get('code')
    if (!code) return

    ;(async () => {
      try {
        const res = await axios.post('/api/auth/discord/callback', {
          code,
          redirectUri: REDIRECT_URI
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })

        const { token, user } = res.data
        if (token) setUser({ ...user, discordId: user?.discordId })
      } catch (err) {
        console.error(err)
        toast.error('Échec de la connexion via Discord.', ToastDefaultOptions)
        setError('Échec de la connexion via Discord.')
      }
    })()
  }, [location.search, login, navigate])

  return (
    <div className="text-center">
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="text-center py-8">
        <h3 className="text-xl font-bold mb-4">Connexion Discord</h3>
        <p className="mb-6 text-blue-300">
          Connectez votre compte Discord pour accéder à des
          fonctionnalités exclusives
        </p>
        { !user?.discordId ? (
          <button
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-3 rounded-lg transition-all flex items-center gap-2 mx-auto"
            onClick={() => window.location.href = AUTH_URL}
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 127.14 96.36"
              fill="currentColor"
            >
              <path
                d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
            </svg>
            Connecter Discord
          </button>
        ) : (null) }
      </div>
    </div>
  )
}

export default Discord
