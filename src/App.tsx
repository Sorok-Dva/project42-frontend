import 'react-toastify/dist/ReactToastify.css'
import 'assets/vendor/nucleo/css/nucleo.css'
import 'assets/vendor/font-awesome/css/fa.all.css'
import 'animate.css'
import 'styles/index.scss'
import 'index.css'
import 'styles/Toastify.css'
import 'styles/Spinner.css'

import React, { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ThemeProvider as SCThemeProvider } from 'styled-components'

import { UserProvider, useUser } from 'contexts/UserContext'
import { AuthProvider } from 'contexts/AuthContext'
import { ErrorProvider, useError } from 'contexts/ErrorContext'

import GoogleTagManager from 'components/GoogleTagManager'
import Navbar from 'components/Layouts/Navbar'
import Footer from 'components/Layouts/Footer'
import NotFound from 'components/ErrorPage/404'
import AdminRoute from 'components/AdminRoute'
import ScrollToTop from 'components/Layouts/ScrollToTop'
import ThemeSwitcher from 'components/Layouts/ThemeSwitcher'

import AdminNavbar from 'components/Layouts/AdminNavbar'
import HomePage from 'pages/HomePage'
import LandingPage from 'pages/LandingPage'
import Login from 'components/Auth/LoginForm'
import Register from 'pages/Register'
import RecoverPassword from 'pages/RecoverPassword'
import AboutPage from 'pages/About'
import PrivacyPolicyPage from 'pages/PrivacyPolicy'
import TOSPage from 'pages/TermsOfService'
import UserProfile from 'pages/UserProfile'
import AdminLayout from 'layouts/Admin'
import UserList from 'pages/admin/users/UserList'
import AdminUserProfile from 'pages/admin/users/UserProfile'
import AdminDashboard from 'pages/admin/Dashboard'
import ResetPassword from 'pages/ResetPassword'
import ServiceUnavailable from 'pages/ServiceUnavailable'
import UserSettingsPage from 'pages/UserSettings'
import ValidateUser from 'pages/ValidateUser'

import { ToastContainer } from 'react-toastify'
import Notifier from 'components/Notifier'
import Leaderboard from './pages/Leaderboard'
import GamePage from 'pages/Game'
import { SocketProvider } from 'contexts/SocketContext'
import ProfileModalProvider from 'contexts/ProfileModalProvider'
import GlobalClickListener from 'components/GlobalClickListener'

const theme = {
  colors: {
    primary: '#0070f3',
    secondary: '#09dfdf',
    background: 'rgba(9,9,9,0)',
    text: '#090909',
  },
}

const AppContent: React.FC = () => {
  const { serverError } = useError()
  const { user } = useUser()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isGameRoute = location.pathname.startsWith('/game')

  return (
    <>
      {!isAdminRoute ? (
        !isGameRoute ? (<Navbar />) : null
      ) : (<AdminNavbar />) }
      <Routes>
        {serverError ? (
          <>
            <Route path="/service-unavailable" element={<ServiceUnavailable />} />
            <Route path="*" element={<Navigate to="/service-unavailable" />} />
          </>
        ) : (
          <>
            {user ? (
              <>
                <Route path="/" element={<HomePage />} />
                <Route path="/settings" element={<UserSettingsPage />} />
                { user.isAdmin && (
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route path="home" element={<AdminDashboard />} />
                      <Route path="users" element={<UserList />} />
                      <Route path="users/:id" element={<AdminUserProfile />} />
                    </Route>
                  </Route>
                )}
              </>
            ) : (
              <>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/recover-password" element={<RecoverPassword />} />
              </>
            )}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TOSPage />} />
            <Route path="/user/:nickname" element={<UserProfile />} />
            <Route path="/users/validate/:token" element={<ValidateUser />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/community/leaderboard" element={<Leaderboard />} />
            <Route path="/game/:id" element={<GamePage />} />
            <Route path="*" element={<NotFound />} />
          </>
        )}
      </Routes>
      {(!isAdminRoute && !isGameRoute) && <Footer />}
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar />
    </>
  )
}

const App: React.FC = () => {
  useEffect(() => {
    const handleMouseOver = (event: MouseEvent) => {
      const target = (event.target as Element)?.closest('.sound-tick:not(.disabled)')
      if (target) {
        const audio = new Audio('/assets/sounds/ui-tick.mp3')
        audio.play()
      }
    }

    document.addEventListener('mouseover', handleMouseOver)
    return () => {
      document.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  return (
    <SCThemeProvider theme={theme}>
      <ErrorProvider>
        <AuthProvider>
          <UserProvider>
            <SocketProvider>
              <ProfileModalProvider>
                <GlobalClickListener />
                <GoogleTagManager />
                <Notifier />
                <AppContent />
                <ScrollToTop />
                <ThemeSwitcher />
              </ProfileModalProvider>
            </SocketProvider>
          </UserProvider>
        </AuthProvider>
      </ErrorProvider>
    </SCThemeProvider>
  )
}

export default App
