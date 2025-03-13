import useDropdown from 'hooks/useDropdown'
import metamask from 'assets/img/metamask.png'
import walletConnect from 'assets/img/walletconnect.png'
import clsx from 'clsx'
import { Img as Image } from 'react-image'
import { Link } from 'react-router-dom'
import React from 'react'

const Wallet: React.FC = () => {
  const { open, ref, toggleOpen } = useDropdown()
  return (
    <div ref={ref} className="position-relative flex-shrink-0">
      <button
        onClick={toggleOpen}
        className="btn-rounded-cus wallet-btn border-0 d-flex align-items-center gap-3 p-xl-2 p-0 pe-xl-6 rounded-5 position-relative">
        <span className="btn-circle fs-2xl">
          <i className="ti ti-wallet"></i>
        </span>
        <span className="text-nowrap d-none d-xl-block">Connect Wallet</span>
      </button>
      {/* <!-- connect your Wallet section start --> */}
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
              Connect Your Wallet
            </h3>
            <div className="wallet-option pb-20">
              <ul className="d-grid gap-sm-8 gap-4">
                <li className="wallet-item p-sm-6 p-2 bgn-3 rounded-4">
                  <Link to="#" className="d-between">
                    <span>Connect with Metamask</span>
                    <div className="wallet-item-thumb">
                      <Image className="w-100" src={metamask} alt="metamask" />
                    </div>
                  </Link>
                </li>
                <li className="wallet-item p-sm-6 p-2 bgn-3 rounded-4">
                  <Link to="#" className="d-between">
                    <span>Connect with Wallet Connect </span>
                    <div className="wallet-item-thumb">
                      <Image
                        className="w-100"
                        src={walletConnect}
                        alt="wallet connect"
                      />
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Wallet
