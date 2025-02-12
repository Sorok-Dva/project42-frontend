import React from 'react'
import { useUser } from 'contexts/UserContext'
import notifications from 'hooks/notifications'

const Notifier: React.FC = () => {
  const { user } = useUser()

  notifications({ token: user ? user.token : 'undefined' })

  return null
}

export default Notifier
