import clsx from 'clsx'
import { Link, useLocation } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import AnimateHeight from 'react-animate-height'
import Notification from './Notification'
import Profile from './Profile'
import Wallet from './Wallet'
import favicon from 'assets/img/favicon.png'
import logo from 'assets/img/logo.png'
import { Img as Image } from 'react-image'

const menuData = [
  {
    id: 1,
    title: 'Home',
    url: '/',
  },
  {
    id: 2,
    title: 'Tournament',
    submenus: [
      {
        id: 1,
        title: 'Tournaments',
        url: '/tournaments/',
      },
      {
        id: 2,
        title: 'Tournaments Details',
        url: '/tournaments/1',
      },
    ],
  },
  {
    id: 3,
    title: 'Game',
    url: '/game/',
  },
  {
    id: 4,
    title: 'Teams',
    submenus: [
      {
        id: 1,
        title: 'Teams',
        url: '/teams/',
      },
      {
        id: 2,
        title: 'Teams Details',
        url: '/teams/1',
      },
    ],
  },
  {
    id: 5,
    title: 'Pages',
    submenus: [
      {
        id: 1,
        title: 'Signup',
        url: '/signup/',
      },
      {
        id: 2,
        title: 'Signin',
        url: '/signin/',
      },
      {
        id: 3,
        title: 'Error',
        url: '/error',
      },
      {
        id: 4,
        title: 'Faq',
        url: '/faq/',
      },
      {
        id: 5,
        title: 'Terms Conditions',
        url: '/terms-condition/',
      },
    ],
  },
]

type submenuType = {
  id: number;
  title: string;
  url: string;
};
const Navbar: React.FC<{
  isTransparent: boolean;
}> = ({ isTransparent }: { isTransparent?: boolean }) => {
  const [navOpen, setNavOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<null | number>(null)

  useEffect(() => {
    window.addEventListener('scroll', function () {
      if (this.window.scrollY > 100) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    })
  }, [])
  const location = useLocation()
  const pathname = location.pathname
  const isActive = (submenus: submenuType[] | undefined) => {
    return submenus?.some(({ url }) => pathname == url)
  }
  return (
    <>
      <header
        className={clsx(
          'header-section w-100',
          scrolled && 'fixed-header',
          !isTransparent && 'fixed-header',
        )}
      >
        <div className="py-sm-6 py-3 mx-xxl-20 mx-md-15 mx-3">
          <div className="d-flex align-items-center justify-content-between gap-xxl-10 gap-lg-8 w-100">
            <nav className="navbar-custom d-flex gap-lg-6 align-items-center flex-column flex-lg-row justify-content-start justify-content-lg-between w-100">
              <div className="top-bar w-100 d-flex align-items-center gap-lg-0 gap-6">
                <button
                  onClick={() => setNavOpen(!navOpen)}
                  className={clsx(
                    'navbar-toggle-btn d-block d-lg-none',
                    navOpen && 'open',
                  )}
                  type="button"
                >
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </button>
                <Link
                  className="navbar-brand d-flex align-items-center gap-4"
                  to="/"
                >
                  <Image className="w-100 logo1" src={favicon} alt="favicon" />
                  <Image className="w-100 logo2" src={logo} alt="logo" />
                </Link>
              </div>
              <div
                className={clsx(
                  'navbar-toggle-item w-100 position-lg-relative',
                  navOpen && 'open',
                )}
              >
                <ul
                  className="custom-nav gap-lg-7 gap-3 cursor-scale growDown2 ms-xxl-10 d-none d-lg-flex"
                  data-lenis-prevent
                >
                  {menuData.map(({ id, title, submenus, url }) => {
                    return url ? (
                      <li key={id} className="menu-link">
                        <Link
                          className={clsx(pathname == url && 'active')}
                          to={url}
                        >
                          {title}
                        </Link>
                      </li>
                    ) : (
                      <li
                        key={id}
                        className={clsx(
                          'menu-item',
                          isActive(submenus) && 'active',
                        )}
                      >
                        <button className="text-capitalize">{title}</button>
                        <ul className="sub-menu">
                          {submenus?.map(({ id, title, url }) => (
                            <li key={id} className="menu-link">
                              <Link
                                className={clsx(pathname == url && 'active')}
                                to={url}
                              >
                                {title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    )
                  })}
                </ul>
                <ul
                  className="custom-nav gap-lg-7 gap-3 cursor-scale growDown2 ms-xxl-10 d-lg-none"
                  data-lenis-prevent
                >
                  {menuData.map(({ id, title, submenus, url }) => {
                    return url ? (
                      <li key={id} className="menu-link">
                        <Link
                          onClick={() => setNavOpen(false)}
                          className={clsx(pathname == url && 'active')}
                          to={url}
                        >
                          {title}
                        </Link>
                      </li>
                    ) : (
                      <li
                        key={id}
                        className={clsx(
                          'menu-item',
                          isActive(submenus) && 'active',
                        )}
                      >
                        <button
                          onClick={() =>
                            setOpenSubmenu((prev) => (prev == id ? null : id))
                          }
                          className="text-capitalize"
                        >
                          {title}
                        </button>
                        <AnimateHeight height={openSubmenu == id ? 'auto' : 0}>
                          <ul className="sub-menu d-block">
                            {submenus?.map(({ id, title, url }) => (
                              <li key={id} className="menu-link">
                                <Link
                                  onClick={() => setNavOpen(false)}
                                  className={clsx(pathname == url && 'active')}
                                  to={url}
                                >
                                  {title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </AnimateHeight>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </nav>
            <div className="header-btn-area d-flex align-items-center gap-sm-6 gap-3">
              <Wallet />
              <Notification />
              <Profile />
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default Navbar
