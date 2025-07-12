'use client'

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  Html,
  Stars,
  ContactShadows,
  Sky,
  Environment,
  useGLTF,
} from '@react-three/drei'
import { AvatarScene } from 'components/Avatar/Animated'

export type AvatarConfig = {
  url: string
  data: {
    nickname: string
    points: number,
    level: number,
    card?: string
  }
  animation: string
  position: [x : number, y : number, z : number]
  rotation?: [x : number, y : number, z : number]
  scale?: number
}

interface MultiAvatarCanvasProps {
  avatars: AvatarConfig[]
  /** Url d'un décor commun, optionnel */
  sceneUrl?: string
  backgroundColor?: string
  /** options de contrôle caméra */
  ctrlMinDist?: number
  ctrlMaxDist?: number
}

export const MultiAvatarCanvas: React.FC<MultiAvatarCanvasProps> = ({
  avatars,
  sceneUrl,
  backgroundColor = '#111',
  ctrlMinDist = 3,
  ctrlMaxDist = 8,
}) => {
  return (
    <Canvas shadows camera={{ position: [0, 2, 6], fov: 30 }}>
      <color attach="background" args={[backgroundColor]} />

      <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />

      {!sceneUrl && (
        <>
          <Sky />
          <Environment preset="sunset" />
        </>
      )}

      <Suspense fallback={<Html center>Chargement…</Html>}>
        <group position={[0, -0.2, 0]}>
          {sceneUrl && (
            <primitive
              object={useGLTF(sceneUrl).scene}
              position={[0, 1.3, 0]}
              scale={0.04}
              dispose={null}
            />
          )}

          <ContactShadows opacity={0.4} scale={10} blur={1} far={5} />

          {avatars.map((cfg, i) => (
            <group
              key={i}
              position={cfg.position}
              rotation={cfg.rotation ?? [0, 0, 0]}
              scale={cfg.scale ?? 1}
            >
              <AvatarScene avatarUrl={cfg.url} animation={cfg.animation} />

              <Html
                position={[0, 2.5, 0]}
                center
                style={{ pointerEvents: 'none' }}
              >
                <div className="
                  bg-black bg-opacity-60
                  text-white font-bold text-sm
                  px-2 py-1 rounded-lg
                  shadow-lg
                ">
                  {cfg.data.nickname}
                </div>
              </Html>
              <Html
                position={[0, 2.5, 0]}
                center
                style={{ pointerEvents: 'none' }}
              >
                <div className="
                  bg-green-600 bg-opacity-60
                  text-white font-bold text-sm text-center
                  mt-18 w-[150px] px-2 py-1 rounded-lg
                  shadow-lg
                ">
                  Niveau {cfg.data.level} <i>(+{cfg.data.points} points)</i>
                </div>
              </Html>
            </group>
          ))}
        </group>
      </Suspense>

      <OrbitControls
        enablePan={false}
        minDistance={ctrlMinDist}
        maxDistance={ctrlMaxDist}
        target={[0, 1, 0]}
      />
    </Canvas>
  )
}
