import React, { useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { useUser } from 'contexts/UserContext'

const notifSound = new Audio('/assets/sounds/notif.mp3')

const LevelUpNotif = ({ title }: { title: string }) => (
  <Link to="/user/profile">
    <div className="msg-container">
      Félicitations ! Vous êtes maintenant un <b>{ title }</b> ! 🌌
    </div>
  </Link>
)

const WinPointsNotif = ({ points }: { points: number }) => (
  <Link to="/user/profile">
    <div className="msg-container">
      Félicitations ! Vous venez de gagner <b>{ points }</b> points ! 🚀
    </div>
  </Link>
)

const LossPointsNotif = ({ points }: { points: number }) => (
  <Link to="/user/profile">
    <div className="msg-container">
      Oh non ! Vous venez de perdre <b>{ points }</b> points 😕
    </div>
  </Link>
)

const AchievementNotif = ({
  title,
  content,
  id,
}: { title: string, content: string, id: number }) => (
  <div className="msg-container">
    <img src={`/assets/images/pictos/${ id }.png`} style={{ height: '20px', marginRight: '5px' }} alt="achievement" />
    <b>{title}</b>: <span dangerouslySetInnerHTML={{ __html: content }} />
  </div>
)

const DefaultNotif = ({
  title,
  message,
}: { title: string, message: string }) => (
  <div className="msg-container">
    <b>{title}</b>: <span dangerouslySetInnerHTML={{ __html: message }} />
  </div>
)

const GameInvitationNotif = ({
  invitationData,
}: {
  invitationData: {
    text: string
    invitation: { gameId: number; invitationLink: string; playersCount: number }
    actions: { label: string; action: string }[]
  }
}) => {
  // Gère l'action en fonction du type de bouton cliqué
  const handleAction = (action: string) => {
    if (action === 'join') {
      window.open(invitationData.invitation.invitationLink, '_blank', 'noopener')
    } else if (action === 'observer') {
      window.open(`${invitationData.invitation.invitationLink}?spectate=true`, '_blank', 'noopener')
    } else if (action === 'decline') {
      // Pour refuser, on se contente ici de fermer le toast
      toast.dismiss()
    }
  }

  return (
    <div className="msg-container">
      <div dangerouslySetInnerHTML={{ __html: invitationData.text }} />
      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        {invitationData.actions.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => handleAction(btn.action)}
            className={`btn btn-${
              btn.action === 'join' ? 'primary' : btn.action === 'observer' ? 'info' : 'danger'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const Notifications = ({ token }: { token: string }) => {
  const { reloadUser } = useUser()
  const [notificationCount, setNotificationCount] = useState(0)
  const baseTitleRef = useRef(document.title)

  useEffect(() => {
    const handleFocus = () => {
      setNotificationCount(0)
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Met à jour le titre de l'onglet en fonction du nombre de notifications
  useEffect(() => {
    if (notificationCount > 0) {
      document.title = `(${notificationCount}) ${baseTitleRef.current}`
    } else {
      document.title = baseTitleRef.current
    }
  }, [notificationCount])

  useEffect(() => {
    if (token === 'undefined') return

    let eventSource: EventSource

    const connectEventSource = () => {
      eventSource = new EventSource(`/api/notifications?token=${token}`)

      eventSource.onmessage = (event) => {
        try {
          const rawData = event.data.replace('data: ', '')
          const parsedData = JSON.parse(rawData)

          const data = typeof parsedData === 'string' ? JSON.parse(parsedData) : parsedData

          if (data.token === token) {
            // Incrémente le compteur à chaque notification reçue
            setNotificationCount(prev => prev + 1)
            window.dispatchEvent(new CustomEvent('notifsUpdated'))
            switch (data.event) {
            case 'levelUp':
              toast.success(<LevelUpNotif title={data.title} />)
              break
            case 'winPoints':
              toast.success(<WinPointsNotif points={data.points} />)
              break
            case 'lossPoints':
              toast.warn(<LossPointsNotif points={data.points} />)
              break
            case 'achievement':
              toast.info(<AchievementNotif title={data.title} content={data.content} id={data.id} />)
              break
            case 'game_invitation': {
              let invitationData = null
              try {
                invitationData = JSON.parse(data.content)
              } catch (e) {
                console.error('Failed to parse invitation data:', e)
              }
              if (invitationData) {
                toast.info(<GameInvitationNotif invitationData={invitationData} />)
              }
              break
            }
            case 'notification':
              toast.info(<DefaultNotif title={data.title} message={data.content} />)
              if (data.title.includes('ami')) {
                window.dispatchEvent(new CustomEvent('friendsChanged'))
              }
              if (data.title.includes('été expulsé de ta station')) {
                reloadUser(true)
                window.dispatchEvent(new CustomEvent('reloadGuildData'))
              }
              if (data.title.includes('candidature a été acceptée')) {
                reloadUser(true)
                window.dispatchEvent(new CustomEvent('reloadGuildData'))
              }
              if (data.title.includes('veut rejoindre ta station')) {
                window.dispatchEvent(new CustomEvent('reloadGuildData'))
              }
              break
            default:
              console.warn('Unhandled event type:', data.event)
            }

            notifSound.currentTime = 0
            notifSound.play().catch(() => {})
          }
        } catch (e) {
          console.error('Error parsing event data:', e)
        }
      }

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error)
        eventSource.close()

        setTimeout(() => {
          console.log('Reconnecting to EventSource...')
          connectEventSource()
        }, 5000)
      }
    }

    connectEventSource()

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [token])

  return null
}

export default Notifications
