import React, { useState } from 'react'
import { useUser } from 'contexts/UserContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faKey,
} from '@fortawesome/free-solid-svg-icons'

const AlphaKeys: React.FC = () => {
  const { isAdmin } = useUser()
  if (!isAdmin) return

  return (
    <div className="container">
      <div className="page-tabs">
        <header>
          <h1><FontAwesomeIcon icon={faKey} /> Gestion des clés alphas</h1>
        </header>

        <div className="content">

        </div>
      </div>
    </div>
  )
}

export default AlphaKeys
