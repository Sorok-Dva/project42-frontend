import React, { useState } from 'react'
import clsx from 'clsx'

type BtnProps = {
  classes?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

const Button = ({ classes, children, onClick }: BtnProps) => {
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    setX(e.nativeEvent.offsetX)
    setY(e.nativeEvent.offsetY)
  }
  const style = {
    '--x': `${x}px`,
    '--y': `${y}px`,
  } as React.CSSProperties
  return (
    <button
      onClick={onClick}
      onMouseMove={handleMouseMove}
      style={style}
      className={clsx(classes, 'box-style')}>
      {children}
    </button>
  )
}

export default Button
