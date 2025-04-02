import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import ReactDOM from 'react-dom'

type BtnProps = {
  classes?: string;
  children: React.ReactNode;
  onClick?: () => void;
  badgeCount?: number;
};

const Button = ({ classes, children, onClick, badgeCount = 0 }: BtnProps) => {
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [badgeStyle, setBadgeStyle] = useState<React.CSSProperties>({})

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    setX(e.nativeEvent.offsetX)
    setY(e.nativeEvent.offsetY)
  }

  const style = {
    '--x': `${x}px`,
    '--y': `${y}px`,
    position: 'relative'
  } as React.CSSProperties

  // Calculer la position du badge par rapport au bouton
  useEffect(() => {
    const updateBadgePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const badgeSize = 30 // taille fixe du badge
        // Positionner le badge en haut à droite du bouton
        const top = rect.top - badgeSize / 2
        const left = rect.left + rect.width - badgeSize / 1.5
        setBadgeStyle({
          position: 'fixed',
          top: `${top}px`,
          left: `${left}px`,
          width: `${badgeSize}px`,
          height: `${badgeSize}px`,
          backgroundColor: 'red',
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          lineHeight: 1,
          textAlign: 'center',
          zIndex: 100,
        })
      }
    }

    // Initialisation et mise à jour lors du redimensionnement
    updateBadgePosition()
    window.addEventListener('resize', updateBadgePosition)
    return () => window.removeEventListener('resize', updateBadgePosition)
  }, [])

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      style={style}
      className={clsx(classes, 'box-style')}
    >
      {children}
      {badgeCount > 0 &&
        ReactDOM.createPortal(
          <span style={badgeStyle}>
            {badgeCount}
          </span>,
          document.body
        )
      }
    </button>
  )
}

export default Button
