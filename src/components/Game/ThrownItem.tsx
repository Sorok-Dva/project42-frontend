'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ThrownItemProps {
  src: string
  onComplete: () => void
}

const ThrownItem: React.FC<ThrownItemProps> = ({ src, onComplete }) => {
  const left = Math.random() * 80 + 10
  return (
    <motion.img
      src={src}
      className="fixed z-50 pointer-events-none w-20 h-20"
      style={{ left: `${left}vw` }}
      initial={{ top: '-20vh', scale: 0.8, rotate: 0 }}
      animate={{ top: '40vh', scale: 1.2, rotate: 720 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    />
  )
}

export default ThrownItem
