import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUser } from 'contexts/UserContext'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { toast } from 'react-toastify'
import { User } from 'types/user'

interface DiscordData {
  id: string
  username: string
  discriminator: string
  avatar: string
}

const CLIENT_ID    = process.env.REACT_APP_DISCORD_CLIENT_ID!
const REDIRECT_URI = process.env.REACT_APP_DISCORD_REDIRECT_URI!
const SCOPE        = 'identify%20email'
const AUTH_URL     = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&response_type=code&scope=${SCOPE}`

const Discord: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, setUser } = useUser()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [discordData, setDiscordData] = useState<DiscordData | null>(null)

  const exchangedRef = useRef(false)

  useEffect(() => {
    const code = new URLSearchParams(location.search).get('code')
    if (!code || exchangedRef.current) return

    exchangedRef.current = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await axios.post(
          '/api/auth/discord/callback',
          { code, redirectUri: REDIRECT_URI },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
        )
        const { token, user: resUser } = res.data
        if (token) setUser({
          ...user,
          discordId: resUser.discordId,
        } as User)
      } catch (err) {
        console.error(err)
        toast.error('Échec de la connexion via Discord.', ToastDefaultOptions)
        setError('Échec de la connexion via Discord.')
      } finally {
        setLoading(false)
        // on nettoie l’URL pour enlever ?code=…
        navigate(location.pathname, { replace: true })
      }
    })()
  }, [location.search, navigate, setUser, location.pathname])

  const handleUnlinkDiscord = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir délier votre compte Discord ?')) return

    try {
      setLoading(true)
      await axios.post(
        '/api/users/unlink-discord',
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      )

      if (user) {
        const updated = { ...user }
        delete updated.discordId
        setUser(updated)
      }
      setDiscordData(null)
      toast.success('Compte Discord délié avec succès.', ToastDefaultOptions)
    } catch (err) {
      console.error(err)
      toast.error('Échec de la déconnexion Discord.', ToastDefaultOptions)
      setError('Échec de la déconnexion Discord.')
    } finally {
      setLoading(false)
    }
  }

  const getDiscordAvatarUrl = () => {
    if (!discordData?.avatar) return 'https://cdn.discordapp.com/embed/avatars/0.png'
    return `https://cdn.discordapp.com/avatars/${discordData.id}/${discordData.avatar}.png?size=128`
  }

  return (
    <div className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-blue-500/30">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" fill="currentColor">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
          </svg>
          Connexion Discord
        </h3>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4 text-red-300">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : user?.discordId ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6 bg-black/40 rounded-lg p-6 border border-blue-500/20">
              <div className="relative">
                <img
                  src={getDiscordAvatarUrl() || '/placeholder.svg'}
                  alt="Discord Avatar"
                  className="w-24 h-24 rounded-full border-4 border-[#5865F2]/30"
                />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-black"></div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h4 className="text-xl font-bold text-white mb-1">
                  {discordData?.username}
                </h4>
                <p className="text-blue-300 mb-4">Compte Discord lié avec succès</p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleUnlinkDiscord}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Délier le compte
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h5 className="font-medium text-white mb-2">Avantages de la connexion Discord</h5>
              <ul className="list-disc list-inside text-blue-300 space-y-1">
                <li>Notifications de jeu directement sur Discord</li>
                <li>Accès aux parties micro</li>
                <li>Synchronisation de votre statut entre le jeu et Discord</li>
                <li>Badges et rôles exclusifs</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-xl font-bold mb-4 text-white">Connectez votre compte Discord</h3>
            <p className="mb-6 text-blue-300">
              Liez votre compte Discord pour accéder à des fonctionnalités exclusives et rejoindre notre communauté.
            </p>
            <button
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-3 rounded-lg transition-all flex items-center gap-2 mx-auto shadow-lg shadow-[#5865F2]/20"
              onClick={() => (window.location.href = AUTH_URL)}
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 127.14 96.36"
                fill="currentColor"
              >
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
              Connecter Discord
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Discord
