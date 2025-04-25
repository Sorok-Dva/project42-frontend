'use client'

import React from 'react'
import { FaHome } from 'react-icons/fa'
import { Button } from 'reactstrap'

const CustomErrorContent: React.FC = () => {
  return (
    <>
      <div className={'error-area bg-dark text-white'}>
        <div className="d-table">
          <div className="d-table-cell">
            <div className="error-content-wrap">
              <h1>
                4 <span>0</span> 4
              </h1>
              <h3>Oops ! Page introuvable</h3>
              <p>La page que vous cherchez n'existe pas.</p>

              <Button color="primary" className="mb-3" href="/">
                <FaHome/> Retour à l'accueil
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CustomErrorContent
