import React, { useState, useEffect } from 'react'
import axios from 'axios'
import clsx from 'clsx'
import useDropdown from 'hooks/useDropdown'
import Button from '../Button'
import { Link } from 'react-router-dom'
import { useAuth } from 'contexts/AuthContext'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons'

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
      const unreadCount = response.data.filter(n => !n.isRead).length
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
      await axios.put(
        `/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setNotifications(notifications.map(n => (n.id === id ? { ...n, isRead: true } : n)))
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
      setNotifications(notifications.filter(n => n.id !== id))
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
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
          {!notification.isRead && invitationData.actions.map((btn, idx) => (
            <button
              key={idx}
              onClick={() =>
                handleGameInvitationAction(notification.id, btn.action, invitationData!.invitation.invitationLink)
              }
              className={`btn ${
                btn.action === 'join'
                  ? 'btn-primary'
                  : btn.action === 'observer'
                    ? 'btn-info'
                    : 'btn-danger'
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
    <div ref={ref} className="position-relative flex-shrink-0">
      <Button onClick={toggleOpen} classes="ntf-btn fs-2xl" badgeCount={notifications.filter(n => !n.isRead).length}>
        <i className="ti ti-bell-filled"></i>
      </Button>
      <div className={clsx('notification-area p-4', { open: open })} data-lenis-prevent>
        <h3>Notifications ({notifications.filter(n => !n.isRead).length})</h3>
        <hr />
        {loading ? (
          <p>Chargement...</p>
        ) : notifications.length === 0 ? (
          <p>Aucune notification.</p>
        ) : (
          <div className="notification-card d-grid gap-4" data-tilt>
            {notifications.map(notification => (
              <React.Fragment key={notification.id}>
                {notification.type === 'game_invitation' ? (
                  <div
                    className="card-item d-flex align-items-center gap-4"
                    style={{ borderColor: notification.isRead ? 'green' : 'yellow' }}
                  >
                    <div className="card-info">
                      <b className="card-title d-block" dangerouslySetInnerHTML={{ __html: notification.title }} />
                      <br />
                      <span className="card-text d-block" style={{ fontSize: '0.9rem' }}>
                        {renderGameInvitation(notification)}
                      </span>
                      <small>
                        <i>{new Date(notification.createdAt).toLocaleString()}</i>
                      </small>
                      <div style={{ marginTop: '5px' }}>
                        {!notification.isRead && (
                          <button className="btn btn-success me-2" onClick={() => markAsRead(notification.id)}>
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        )}
                        <button className="btn btn-danger" onClick={() => deleteNotification(notification.id)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link to="#" key={notification.id}>
                    <div
                      className="card-item d-flex align-items-center gap-4"
                      style={{ borderColor: notification.isRead ? 'green' : 'yellow' }}
                    >
                      <div className="card-info">
                        <b
                          className="card-title d-block tcn-1"
                          dangerouslySetInnerHTML={{ __html: notification.title }}
                        />
                        <br />
                        <span
                          className="card-text d-block tcn-1 fs-sm"
                          dangerouslySetInnerHTML={{ __html: notification.message }}
                        />
                        <small>
                          <i>{new Date(notification.createdAt).toLocaleString()}</i>
                        </small>
                        <div>
                          {!notification.isRead && (
                            <button className="btn btn-success me-2" onClick={() => markAsRead(notification.id)}>
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                          )}
                          <button className="btn btn-danger" onClick={() => deleteNotification(notification.id)}>
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                <hr />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
