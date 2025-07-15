import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useError } from './ErrorContext'
import useApi from '../hooks/useApi'
import { User } from 'types/user'

interface UserContextType {
  user: User | null;
  setUser: (user : User | null) => void;
  logout: () => void;
  login: (user : Omit<User, 'behaviorPoints' | 'moderatorPoints'>, token : string, returnToHome?: boolean) => void;
  isAdmin: boolean;
  navigateTo: (path : string) => void;
  reloadUser: (forceReload?: boolean) => void;
  loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider : React.FC<{ children : ReactNode }> = ({ children }) => {
  console.log('Initializing UserProvider')

  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()
  const [stopRequest, setStopRequest] = useState(false)
  const [loading, setLoading] = useState(true)
  const [avatarRedirected, setAvatarRedirected] = useState<boolean>(() => {
    const introShown = sessionStorage.getItem('avatarIntroShown') === 'true'
    return introShown && Boolean(user?.rpmAvatarId && user?.rpmUserId)
  })

  const { setServerError } = useError()
  const { setToken } = useAuth()
  const callApi = useApi()

  const navigateTo = (path : string) => {
    navigate(path)
  }

  const logout = useCallback(() => {
    setLoading(true)
    setUser(null)
    localStorage.removeItem('token')
    window.location.href = '/'
  }, [navigateTo])

  const fetchMe = useCallback((forceReload?: boolean) => {
    const token = localStorage.getItem('token')
    if (token && (!stopRequest || forceReload)) {
      callApi('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((data) => {
          setUser(data)
          setStopRequest(true)
        })
        .catch((error) => {
          setStopRequest(true)
          const forbidden = error.message.includes('403')
          if (forbidden) {
            logout()
          } else {
            setServerError(error)
            setUser(null)
          }
        }).finally(() => setLoading(false))
    }
  }, [user, stopRequest, callApi, logout, setServerError])

  useEffect(() => {
    fetchMe(false)
    setLoading(false)
  }, [fetchMe])

  const login = (user: User, token: string, returnTomHome = true) => {
    setLoading(false)
    setUser(user)
    setToken(token)
    localStorage.setItem('token', token)
    if (returnTomHome) navigateTo('/')
  }

  useEffect(() => {
    if (user && (!user.rpmUserId || !user.rpmAvatarId) && !avatarRedirected) {
      sessionStorage.setItem('avatarIntroShown', 'true')
      setAvatarRedirected(true)
      navigate('/account/settings?avatarIntro=1')
    }
  }, [user, avatarRedirected, navigate])

  const isAdmin = user?.roleId === 1

  return (
    <UserContext.Provider value={ { user, setUser, logout, login, isAdmin, navigateTo, reloadUser: fetchMe, loading  } }>
      { children }
    </UserContext.Provider>
  )
}

export const useUser = () : UserContextType => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
