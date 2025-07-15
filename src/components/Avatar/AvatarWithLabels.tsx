'use client'

import React, { useEffect, useRef, useState, Suspense } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { AvatarScene } from 'components/Avatar/Animated'
import type { AvatarConfig } from './MultiScene'

export const AvatarWithLabels: React.FC<{ config: AvatarConfig }> = ({ config }) => {
  const ref = useRef<THREE.Group>(null)
  const [labelY, setLabelY] = useState(2.5)

  useEffect(() => {
    if (ref.current) {
      const box = new THREE.Box3().setFromObject(ref.current)
      const top = box.max.y
      setLabelY(top + 0.3)
    }
  }, [])

  return (
    <group
      ref={ref}
      position={config.position}
      rotation={config.rotation ?? [0, 0, 0]}
      scale={config.scale ?? 1}
    >
      <AvatarScene avatarUrl={config.url} animation={config.animation} />

      <Html
        position={[0, labelY + 0.2, 0]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div className="
          bg-black bg-opacity-60
          text-white font-bold text-sm
          px-2 py-1 rounded-lg
          shadow-lg
        ">
          {config.data.nickname}
        </div>
      </Html>

      <Html
        position={[0, labelY, 0]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div className="
          bg-green-600 bg-opacity-60
          text-white font-bold text-sm text-center
          w-[150px] px-2 py-1 rounded-lg
          shadow-lg
        ">
          Niveau {config.data.level} <i>(+{config.data.points} points)</i>
        </div>
      </Html>
    </group>
  )
}
