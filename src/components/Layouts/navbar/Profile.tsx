import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Img as Image } from 'react-image'
import clsx from 'clsx'
import useDropdown from 'hooks/useDropdown'
import { useUser } from 'contexts/UserContext'

const Profile: React.FC = () => {
  const { user, logout } = useUser()
  const { open, toggleOpen } = useDropdown()

  const handleLogout = () => {
    logout()
    localStorage.removeItem('token')
  }

  useEffect(() => {
    if (open) {
      document.addEventListener('mouseup', toggleOpen)
    } else {
      document.removeEventListener('mouseup', toggleOpen)
    }
    return () => {
      document.removeEventListener('mouseup', toggleOpen)
    }
  }, [open])

  if (!user) return
  return (
    <div className="position-relative flex-shrink-0">
      <div onClick={toggleOpen} className="header-profile pointer">
        <div className="profile-wrapper d-flex align-items-center gap-3">
          <div className="img-area overflow-hidden">
            <Image className="w-100" src={ user.avatar } alt="profile" />
          </div>
          <span className="user-name d-none d-xxl-block text-nowrap">
            { user.nickname }
          </span>
          <i className="ti ti-chevron-down d-none d-xxl-block"></i>
        </div>
      </div>

      <div className={clsx('user-account-popup p-4', open && 'open')}>
        <div className="account-items d-grid gap-1" data-tilt>
          <div className="user-level-area p-3">
            <div className="user-info d-between">
              <span className="user-name fs-five">{user.nickname}</span>
              {/*<div className="badge d-flex align-items-center">
                <i className="ti ti-medal fs-three fs-normal tcp-2"></i>
                <i className="ti ti-medal fs-three fs-normal tcp-2"></i>
                <i className="ti ti-medal fs-three fs-normal tcp-2"></i>
              </div>*/}
            </div>
            <div className="user-level">
              <span className="level-title tcn-6">Niveau {user.level}</span>
              <div className="level-bar my-1">
                <div className="level-progress" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>
          <Link to="#" data-profile={user.nickname} className="account-item">
            Voir mon profil
          </Link>
          <Link to="/account/settings" className="account-item">
            Mon compte
          </Link>
          <hr/>
          <button className="bttn account-item" onClick={handleLogout}>Déconnexion</button>
        </div>
      </div>
    </div>
  )
}

export default Profile
