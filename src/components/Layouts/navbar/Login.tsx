import React, { useState } from 'react'
import clsx from 'clsx'

import { Link } from 'react-router-dom'
import useDropdown from 'hooks/useDropdown'
import LoginForm from 'components/Auth/LoginForm'

const Login: React.FC = () => {
  const { open, toggleOpen } = useDropdown()

  const [loginFormOpened, setLoginFormOpened] = useState(false)

  const handleLoginForm = () => {
    setLoginFormOpened(!loginFormOpened)
  }
  return (
    <div className="position-relative flex-shrink-0">
      <button
        onClick={toggleOpen}
        className="btn-rounded-cus wallet-btn border-0 d-flex align-items-center gap-3 p-xl-2 p-0 pe-xl-6 rounded-5 position-relative">
        <span className="btn-circle fs-2xl">
          <i className="ti ti-user"></i>
        </span>
        <span className="text-nowrap d-none d-xl-block">Se connecter ou s'inscrire</span>
      </button>
      <div
        className={clsx(
          'connect-wallet-section position-fixed top-0 start-0 w-100 vh-100',
          open && 'active'
        )}>
        <div
          onClick={toggleOpen}
          className="connect-wallet-overlay position-absolute top-0 start-0 w-100 h-100"></div>
        <div className="vh-100 wallet-wrapper d-center">
          <div className="wallet-area pt-lg-8 pt-sm-6 pt-4 pb-lg-20 pb-sm-10 pb-6 px-lg-15 px-sm-8 px-3 bgn-4 rounded-5 ">
            <div className="mb-lg-7 mb-sm-5 mb-3 d-flex justify-content-end">
              <i
                onClick={toggleOpen}
                className="ti ti-circle-x display-four fw-normal pointer wallet-close-btn"></i>
            </div>
            <h3 className="tcn-1 cursor-scale growDown title-anim mb-lg-20 mb-sm-10 mb-6">
              Se connecter ou s'inscrire
            </h3>
            <div className="wallet-option pb-20">
              { loginFormOpened && (
                <>
                  <Link to="#" onClick={handleLoginForm} className='btn-half-border position-relative d-inline-block py-2 px-6 bgp-1 rounded-pill'>⬅️</Link>
                  <LoginForm toggle={toggleOpen} />
                </>
              )}

              { !loginFormOpened && (
                <ul className="d-grid gap-sm-8 gap-4">
                  <li className="wallet-item p-sm-6 p-2 bgn-3 rounded-4">
                    <Link to="#" className="d-between" onClick={handleLoginForm}>
                      <span>Se connecter</span>
                      <div className="wallet-item-thumb">
                        <h2>🛰️</h2>
                      </div>
                    </Link>
                  </li>
                  <li className="wallet-item p-sm-6 p-2 bgn-3 rounded-4">
                    <Link to="/register" onClick={toggleOpen} className="d-between">
                      <span>S'inscrire</span>
                      <div className="wallet-item-thumb">
                        <h2>🚀</h2>
                      </div>
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
