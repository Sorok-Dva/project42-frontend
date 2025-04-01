import React, { useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

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

const Notifications = ({ token }: { token: string }) => {
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
            case 'notification':
              toast.info(<DefaultNotif title={data.title} message={data.content} />)
              if (data.title.includes('ami')) {
                window.dispatchEvent(new CustomEvent('friendsChanged'))
              }
              break
            default:
              console.warn('Unhandled event type:', data.event)
            }
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
