export interface EventTheme {
  id: string
  name: string
  startDate: Date
  endDate: Date
  isActive: boolean
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  animations: {
    particles?: ParticleConfig
    background?: BackgroundAnimation
    ui?: UIAnimation
  }
  sounds?: {
    ambient?: string
    interaction?: string
  }
  decorations: DecorationConfig[]
}

export interface ParticleConfig {
  type: 'snow' | 'leaves' | 'hearts' | 'stars' | 'fireworks' | 'pumpkins' | 'confetti'
  count: number
  speed: number
  size: { min: number; max: number }
  colors: string[]
  opacity: { min: number; max: number }
}

export interface BackgroundAnimation {
  type: 'gradient' | 'aurora' | 'lightning' | 'fog'
  intensity: number
  colors: string[]
}

export interface UIAnimation {
  type: 'glow' | 'pulse' | 'shake' | 'bounce'
  elements: string[]
  duration: number
}

export interface DecorationConfig {
  type: 'overlay' | 'border' | 'icon' | 'banner'
  position: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'corners'
  element: string
  animation?: string
}

export interface EventNotification {
  id: string
  eventId: string
  title: string
  message: string
  type: 'info' | 'celebration' | 'warning'
  icon: string
  showOnce: boolean
  priority: number
}
