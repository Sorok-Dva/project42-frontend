import React from 'react'
import { useUser } from 'contexts/UserContext'
import Notifications from 'hooks/notifications'

const Notifier: React.FC = () => {
  const { user } = useUser()

  return <Notifications token={user ? user.token : 'undefined'} />
}

export default Notifier
