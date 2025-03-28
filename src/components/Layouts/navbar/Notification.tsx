import React from 'react'
import useDropdown from 'hooks/useDropdown'
import clsx from 'clsx'
import { Img as Image } from 'react-image'
import { Link } from 'react-router-dom'
import Button from '../Button'
import { useUser } from 'contexts/UserContext'

const Notification: React.FC = () => {
  const { user } = useUser()
  const { open, ref, toggleOpen } = useDropdown()
  return (
    <div ref={ref} className="position-relative flex-shrink-0">
      <Button onClick={toggleOpen} classes="ntf-btn fs-2xl">
        <i className="ti ti-bell-filled"></i>
      </Button>
      <div
        className={clsx('notification-area p-4', { open: open })}
        data-lenis-prevent>
        <div className="notification-card d-grid gap-4" data-tilt>
          <Link to="#">
            <div className="card-item d-flex align-items-center gap-4">
              <div className="card-img-area">
                <Image
                  className="w-100 rounded-circle"
                  src={user?.avatar || '/img/defaultAvatar.png'}
                  alt="profile"
                />
              </div>
              <div className="card-info">
                <span className="card-title d-block tcn-1">
                  {' '}
                  Pseudo
                </span>
                <span className="card-text d-block tcn-1 fs-sm">
                  Demande d'ami
                </span>
              </div>
            </div>
          </Link>
          <Link to="#">
            <div className="card-item d-flex align-items-center gap-4">
              <div className="card-info">
                <span className="card-title d-block tcn-1">
                  {' '}
                  Partie #1 terminée{' '}
                </span>
                <span className="card-text d-block tcn-1 fs-sm">
                  Vous avez gagné
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Notification
