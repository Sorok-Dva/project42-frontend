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
import { Route, Routes, useLocation } from 'react-router-dom'

import { UserProvider, useUser } from 'contexts/UserContext'
import { AuthProvider, useAuth } from 'contexts/AuthContext'
import { ErrorProvider, useError } from 'contexts/ErrorContext'
import { MaintenanceProvider, useMaintenance } from 'contexts/MaintenanceContext'

import Bootstrap from 'components/Layouts/Bootstrap'

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
import AdminLayout from 'layouts/Admin'
import UserList from 'pages/admin/users/UserList'
import AdminUserProfile from 'pages/admin/users/UserProfile'
import AdminDashboard from 'pages/admin/Dashboard'
import AdminAlphaKeys from 'pages/admin/AlphaKeys'
import AdminNews from 'pages/admin/News'
import AdminShop from 'pages/admin/Shop'
import AdminShopTransactions from 'pages/admin/ShopTransactions'
import AdminCreditTransactions from 'pages/admin/CreditTransactions'
// import AdminRooms from 'pages/admin/games/List'
import AdminCards from 'pages/admin/cards/List'
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
import MaintenancePage from 'pages/Maintenance'
import Guilds from 'pages/GuildsList'
import Guild from 'pages/GuildPage'
import News from 'pages/News'
import Shop from 'pages/Shop'

import Tchat from 'components/HomePage/Tchat'
import LoadingScreen from 'components/Layouts/LoadingScreen'
import { DailyRewardsProvider } from 'contexts/DailyRewardsContext'
import DailyRewardsPopup from 'components/DailyRewardPopup'

const AppContent: React.FC = () => {
  const { serverMaintenance, loading: maintenanceLoading } = useMaintenance()
  const { serverError } = useError()
  const { token } = useAuth()
  const { user, loading: userLoading } = useUser()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/moderator')
  const isGameRoute = location.pathname.startsWith('/game')

  const isInitializing = maintenanceLoading || userLoading

  if (isInitializing) {
    return <LoadingScreen />
  }

  if (serverMaintenance && !user?.isAdmin) {
    return (
      <Routes>
        <Route path="*" element={<MaintenancePage />} />
      </Routes>
    )
  }

  return (
    <>
      {!isGameRoute && !isAdminRoute && (
        <>
          <Navbar isTransparent={true} />
          <Tchat />
        </>
      )}
      <Routes>
        {serverError ? (
          <>
            <Route path="*" element={<ServiceUnavailable />} />
          </>
        ) : (
          <>
            {token ? (
              <>
                { user && (
                  <>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/account/settings" element={<UserSettingsPage />} />
                    <Route path="/shop" element={<Shop />} />
                    { user.isAdmin && (
                      <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<AdminLayout />}>
                          <Route path="/admin" element={<AdminDashboard />} />
                          <Route path="users" element={<UserList />} />
                          <Route path="users/:id" element={<AdminUserProfile />} />
                          <Route path="alpha-keys" element={<AdminAlphaKeys />} />
                          <Route path="news" element={<AdminNews />} />
                          <Route path="shop" element={<AdminShop />} />
                          <Route path="shop/transactions" element={<AdminShopTransactions />} />
                          <Route path="credits/transactions" element={<AdminCreditTransactions />} />
                          <Route path="cards" element={<AdminCards />} />
                          {/*<Route path="rooms" element={<AdminRooms />} />*/}
                        </Route>
                      </Route>
                    )}
                    { user.role === 'Moderator' && (
                      <Route element={<AdminRoute />}>
                        <Route path="/moderator" element={<AdminLayout />}>
                          <Route path="/moderator" element={<AdminDashboard />} />
                          <Route path="users" element={<UserList />} />
                          <Route path="users/:id" element={<AdminUserProfile />} />
                          <Route path="alpha-keys" element={<AdminAlphaKeys />} />
                          {/*<Route path="rooms" element={<AdminRooms />} />*/}
                        </Route>
                      </Route>
                    )}
                  </>
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
            <Route path="/users/validate/:token" element={<ValidateUser />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/community/leaderboard" element={<Leaderboard />} />
            <Route path="/news" element={<News />} />
            <Route path="/game/:id" element={<GamePage />} />
            <Route path="/stations" element={<Guilds />} />
            <Route path="/station/:id" element={<Guild />} />
            <Route path="*" element={<NotFound />} />
          </>
        )}
      </Routes>
      {(!isAdminRoute && !isGameRoute) && <Footer />}
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar style={{ zIndex: 9999 }} />
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
                <Bootstrap>
                  <DailyRewardsProvider>
                    <GlobalClickListener />
                    <GoogleTagManager />
                    <Notifier />
                    <AppContent />
                    <ScrollToTop />
                    <DailyRewardsPopup />
                  </DailyRewardsProvider>
                </Bootstrap>
              </ModalProvider>
            </SocketProvider>
          </UserProvider>
        </AuthProvider>
      </ErrorProvider>
    </MaintenanceProvider>
  )
}

export default App
