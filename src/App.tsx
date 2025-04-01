import 'react-toastify/dist/ReactToastify.css'
import 'react-tooltip/dist/react-tooltip.css'
import 'assets/vendor/nucleo/css/nucleo.css'
import 'assets/vendor/font-awesome/css/fa.all.css'
import 'assets/styles/scss/style.scss'
import 'animate.css'
import 'styles/index.scss'
import 'index.css'
import 'styles/Toastify.css'
import 'styles/Spinner.css'

import React, { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { UserProvider, useUser } from 'contexts/UserContext'
import { AuthProvider } from 'contexts/AuthContext'
import { ErrorProvider, useError } from 'contexts/ErrorContext'
import { MaintenanceProvider, useMaintenance } from 'contexts/MaintenanceContext'

import GoogleTagManager from 'components/GoogleTagManager'
import Navbar from 'components/Layouts/navbar/Navbar'
import Footer from 'components/Layouts/Footer'
import NotFound from 'components/ErrorPage/404'
import AdminRoute from 'components/AdminRoute'
import ScrollToTop from 'components/Layouts/ScrollToTop'

import HomePage from 'pages/HomePage'
import LandingPage from 'pages/LandingPage'
import Login from 'components/Auth/LoginForm'
import Register from 'pages/Register'
import RecoverPassword from 'pages/RecoverPassword'
import TOSPage from 'pages/TermsOfService'
import UserProfile from 'pages/UserProfile'
import AdminLayout from 'layouts/Admin'
import UserList from 'pages/admin/users/UserList'
import AdminUserProfile from 'pages/admin/users/UserProfile'
import AdminDashboard from 'pages/admin/Dashboard'
import AdminAlphaKeys from 'pages/admin/AlphaKeys'
import ResetPassword from 'pages/ResetPassword'
import ServiceUnavailable from 'pages/ServiceUnavailable'
import UserSettingsPage from 'pages/UserSettings'
import ValidateUser from 'pages/ValidateUser'

import { ToastContainer } from 'react-toastify'
import Notifier from 'components/Notifier'
import Leaderboard from './pages/Leaderboard'
import GamePage from 'pages/Game'
import { SocketProvider } from 'contexts/SocketContext'
import ModalProvider from 'contexts/ModalProvider'
import GlobalClickListener from 'components/GlobalClickListener'
import SplitTextAnimations from 'utils/SplitTextAnim'
import MaintenancePage from 'pages/Maintenance'


const AppContent: React.FC = () => {
  const { serverMaintenance } = useMaintenance()
  const { serverError } = useError()
  const { user } = useUser()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isGameRoute = location.pathname.startsWith('/game')

  if (serverMaintenance) {
    return (
      <Routes>
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="*" element={<Navigate to="/maintenance" />} />
      </Routes>
    )
  }
  return (
    <>
      {!isGameRoute && (<Navbar isTransparent={true} />) }
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
                <Route path="/account/settings" element={<UserSettingsPage />} />
                { user.isAdmin && (
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route path="home" element={<AdminDashboard />} />
                      <Route path="users" element={<UserList />} />
                      <Route path="users/:id" element={<AdminUserProfile />} />
                      <Route path="alpha-keys" element={<AdminAlphaKeys />} />
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
    const uiTick = new Audio('/assets/sounds/ui-tick.mp3')

    const handleMouseOver = (event: MouseEvent) => {
      const target = (event.target as Element)?.closest('.sound-tick:not(.disabled)')
      if (target) {
        uiTick.currentTime = 0
        uiTick.play().catch(() => {})
      }
    }

    document.addEventListener('mouseover', handleMouseOver)
    return () => {
      document.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  return (
    <MaintenanceProvider>
      <ErrorProvider>
        <AuthProvider>
          <UserProvider>
            <SocketProvider>
              <ModalProvider>
                <GlobalClickListener />
                <GoogleTagManager />
                <Notifier />
                <AppContent />
                <ScrollToTop />
                <SplitTextAnimations />
              </ModalProvider>
            </SocketProvider>
          </UserProvider>
        </AuthProvider>
      </ErrorProvider>
    </MaintenanceProvider>
  )
}

export default App
