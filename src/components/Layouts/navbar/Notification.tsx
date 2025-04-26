'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import clsx from 'clsx'
import useDropdown from 'hooks/useDropdown'
import Button from '../Button'
import { useAuth } from 'contexts/AuthContext'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'

interface NotificationItem {
  id: number
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

const Notifications: React.FC = () => {
  const { token } = useAuth()
  const { open, ref, toggleOpen } = useDropdown()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [notificationCount, setNotificationCount] = useState<number>(0)

  // Réinitialiser le compteur lorsque la page redevient active
  useEffect(() => {
    const handleFocus = () => {
      setNotificationCount(0)
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // Récupérer les notifications depuis le backend
  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await axios.get<NotificationItem[]>('/api/notifications/get', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(response.data)
      const unreadCount = response.data.filter((n) => !n.isRead).length
      setNotificationCount(unreadCount)
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token && token !== 'undefined') {
      fetchNotifications()
      window.addEventListener('notifsUpdated', fetchNotifications)
      return () => window.removeEventListener('notifsUpdated', fetchNotifications)
    }
  }, [token, open])

  // Marquer une notification comme lue
  const markAsRead = async (id: number) => {
    try {
      await axios.put(`/api/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } })
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
      toast.info('Notification lue.', ToastDefaultOptions)
      setNotificationCount(notificationCount - 1)
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification', error)
      toast.error('Erreur lors de la mise à jour de la notification.', ToastDefaultOptions)
    }
  }

  // Supprimer une notification
  const deleteNotification = async (id: number) => {
    try {
      await axios.delete(`/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(notifications.filter((n) => n.id !== id))
      toast.info('Notification supprimée.', ToastDefaultOptions)
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification', error)
      toast.error('Erreur lors de la suppression de la notification.', ToastDefaultOptions)
    }
  }

  // Gestion des actions pour une invitation à une partie
  const handleGameInvitationAction = (notificationId: number, action: string, invitationLink: string) => {
    if (action === 'join') {
      window.open(invitationLink, '_blank', 'noopener')
    } else if (action === 'observer') {
      window.open(`${invitationLink}?spectate=true`, '_blank', 'noopener')
    }

    markAsRead(notificationId)
  }

  // Rendu personnalisé pour une notification de type "game_invitation"
  const renderGameInvitation = (notification: NotificationItem) => {
    let invitationData: {
      text: string
      invitation: { gameId: number; invitationLink: string; playersCount: number }
      actions: { label: string; action: string }[]
    } | null = null
    try {
      invitationData = JSON.parse(notification.message)
    } catch (e) {
      console.error('Erreur lors du parsing de la notification game_invitation', e)
    }
    if (!invitationData) {
      return (
        <div>
          <strong>{notification.title}</strong>
          <p>{notification.message}</p>
        </div>
      )
    }
    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: invitationData.text }} />
        <div className="flex gap-2 mt-3">
          {!notification.isRead &&
            invitationData.actions.map((btn, idx) => (
              <button
                key={idx}
                onClick={() =>
                  handleGameInvitationAction(notification.id, btn.action, invitationData!.invitation.invitationLink)
                }
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  btn.action === 'join'
                    ? 'bg-indigo-600/70 hover:bg-indigo-500/70 text-white'
                    : btn.action === 'observer'
                      ? 'bg-cyan-600/70 hover:bg-cyan-500/70 text-white'
                      : 'bg-red-600/70 hover:bg-red-500/70 text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <Button
        onClick={toggleOpen}
        classes="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/50 transition-all duration-300"
        badgeCount={notifications.filter((n) => !n.isRead).length}
      >
        <i className="ti ti-bell-filled text-xl text-slate-200"></i>
      </Button>

      <div
        className={clsx(
          'absolute right-0 top-full mt-2 w-96 max-w-[90vw] bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700/50 shadow-xl shadow-indigo-900/20 z-50 transform transition-all duration-300 origin-top-right',
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none',
        )}
        data-lenis-prevent
      >
        <div className="p-4">
          <h3 className="text-lg font-medium text-slate-100 flex items-center gap-2 mb-3">
            <i className="ti ti-bell text-indigo-400"></i>
            Notifications
            <span className="text-sm font-normal text-slate-400">
              ({notifications.filter((n) => !n.isRead).length})
            </span>
          </h3>

          <div className="border-t border-slate-700/50 mb-3"></div>

          <div className="max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-slate-400">Chargement...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <i className="ti ti-bell-off text-3xl mb-2 block"></i>
                Aucune notification.
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="group">
                    {notification.type === 'game_invitation' ? (
                      <div
                        className={`rounded-lg p-3 border transition-all ${
                          notification.isRead
                            ? 'bg-slate-800/30 border-green-700/30'
                            : 'bg-slate-800/50 border-yellow-500/30 shadow-lg shadow-yellow-900/10'
                        }`}
                      >
                        <div>
                          <h4
                            className="font-medium text-slate-200 mb-1"
                            dangerouslySetInnerHTML={{ __html: notification.title }}
                          />
                          <div className="text-slate-300 text-sm">{renderGameInvitation(notification)}</div>
                          <div className="mt-2 text-xs text-slate-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </div>
                          <div className="mt-2 flex gap-2">
                            {!notification.isRead && (
                              <button
                                className="p-1.5 rounded-md bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <i className="ti ti-eye text-sm"></i>
                              </button>
                            )}
                            <button
                              className="p-1.5 rounded-md bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <i className="ti ti-trash text-sm"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`rounded-lg p-3 border transition-all ${
                          notification.isRead
                            ? 'bg-slate-800/30 border-green-700/30'
                            : 'bg-slate-800/50 border-yellow-500/30 shadow-lg shadow-yellow-900/10'
                        }`}
                      >
                        <h4
                          className="font-medium text-slate-200 mb-1"
                          dangerouslySetInnerHTML={{ __html: notification.title }}
                        />
                        <div
                          className="text-slate-300 text-sm"
                          dangerouslySetInnerHTML={{ __html: notification.message }}
                        />
                        <div className="mt-2 text-xs text-slate-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                        <div className="mt-2 flex gap-2">
                          {!notification.isRead && (
                            <button
                              className="p-1.5 rounded-md bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <i className="ti ti-eye text-sm"></i>
                            </button>
                          )}
                          <button
                            className="p-1.5 rounded-md bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <i className="ti ti-trash text-sm"></i>
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="border-t border-slate-800/50 my-3"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications
