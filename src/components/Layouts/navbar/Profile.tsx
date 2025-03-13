import useDropdown from 'hooks/useDropdown'
import profile from 'assets/img/profile.png'
import clsx from 'clsx'
import { Img as Image } from 'react-image'
import { Link } from 'react-router-dom'
import React from 'react'

const Profile: React.FC = () => {
  const { open, ref, toggleOpen } = useDropdown()
  return (
    <div ref={ref} className="position-relative flex-shrink-0">
      <div onClick={toggleOpen} className="header-profile pointer">
        <div className="profile-wrapper d-flex align-items-center gap-3">
          <div className="img-area overflow-hidden">
            <Image className="w-100" src={profile} alt="profile" />
          </div>
          <span className="user-name d-none d-xxl-block text-nowrap">
            David Malan
          </span>
          <i className="ti ti-chevron-down d-none d-xxl-block"></i>
        </div>
      </div>

      <div className={clsx('user-account-popup p-4', open && 'open')}>
        <div className="account-items d-grid gap-1" data-tilt>
          <div className="user-level-area p-3">
            <div className="user-info d-between">
              <span className="user-name fs-five">David Malan</span>
              <div className="badge d-flex align-items-center">
                <i className="ti ti-medal fs-three fs-normal tcp-2"></i>
                <i className="ti ti-medal fs-three fs-normal tcp-2"></i>
                <i className="ti ti-medal fs-three fs-normal tcp-2"></i>
              </div>
            </div>
            <div className="user-level">
              <span className="level-title tcn-6">Level</span>
              <div className="level-bar my-1">
                <div className="level-progress" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>
          <Link to="/profile" className="account-item">
            View Profile
          </Link>
          <Link to="/chat" className="account-item">
            Message
          </Link>
          <button className="bttn account-item">Logout</button>
        </div>
      </div>
    </div>
  )
}

export default Profile
