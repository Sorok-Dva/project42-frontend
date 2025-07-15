'use client'

import type React from 'react'
import { useEffect, useRef } from 'react'
import type { ParticleConfig } from 'types/events'

interface ParticleSystemProps {
  config: ParticleConfig
  isActive: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  rotation: number
  rotationSpeed: number
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ config, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!isActive || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Redimensionner le canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialiser les particules
    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < config.count; i++) {
        particlesRef.current.push(createParticle())
      }
    }

    const createParticle = (): Particle => {
      const size = config.size.min + Math.random() * (config.size.max - config.size.min)
      const color = config.colors[Math.floor(Math.random() * config.colors.length)]
      const opacity = config.opacity.min + Math.random() * (config.opacity.max - config.opacity.min)

      return {
        x: Math.random() * canvas.width,
        y: config.type === 'snow' ? -size : Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * config.speed,
        vy: config.speed * (0.5 + Math.random() * 0.5),
        size,
        color,
        opacity,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
      }
    }

    const updateParticle = (particle: Particle) => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.rotation += particle.rotationSpeed

      // Effets spéciaux selon le type
      switch (config.type) {
      case 'snow':
        particle.vx += Math.sin(particle.y * 0.01) * 0.1
        break
      case 'hearts':
        particle.vx += Math.sin(particle.y * 0.02) * 0.2
        particle.vy *= 0.99
        break
      case 'fireworks':
        particle.vy += 0.1 // gravité
        particle.opacity *= 0.995
        break
      case 'leaves':
        particle.vx += Math.sin(particle.y * 0.01) * 0.3
        particle.rotation += 0.05
        break
      }

      // Réinitialiser les particules qui sortent de l'écran
      if (particle.y > canvas.height + particle.size) {
        Object.assign(particle, createParticle())
        particle.y = -particle.size
      }
      if (particle.x > canvas.width + particle.size) {
        particle.x = -particle.size
      }
      if (particle.x < -particle.size) {
        particle.x = canvas.width + particle.size
      }
    }

    const drawParticle = (particle: Particle) => {
      ctx.save()
      ctx.globalAlpha = particle.opacity
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rotation)

      switch (config.type) {
      case 'snow':
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'hearts':
        ctx.fillStyle = particle.color
        ctx.font = `${particle.size}px Arial`
        ctx.textAlign = 'center'
        ctx.fillText('💖', 0, particle.size / 3)
        break

      case 'pumpkins':
        ctx.font = `${particle.size}px Arial`
        ctx.textAlign = 'center'
        ctx.fillText('🎃', 0, particle.size / 3)
        break

      case 'fireworks':
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
        ctx.fill()
        // Effet de traînée
        ctx.globalAlpha = particle.opacity * 0.3
        ctx.beginPath()
        ctx.arc(-particle.vx * 2, -particle.vy * 2, particle.size * 0.5, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'confetti':
        ctx.fillStyle = particle.color
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size / 4)
        break

      case 'leaves': {
        ctx.font = `${particle.size}px Arial`
        ctx.textAlign = 'center'
        const leaves = ['🍂', '🍁', '🌿']
        const leaf = leaves[Math.floor(particle.x) % leaves.length]
        ctx.fillText(leaf, 0, particle.size / 3)
      } break

      default:
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        updateParticle(particle)
        drawParticle(particle)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    initParticles()
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [config, isActive])

  if (!isActive) return null

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" style={{ mixBlendMode: 'screen' }} />
  )
}
