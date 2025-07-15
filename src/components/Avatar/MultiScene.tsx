'use client'

import React, { Suspense, useEffect, useRef, useState } from 'react'
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
import { AvatarWithLabels } from './AvatarWithLabels'

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
  sceneUrl?: string
  backgroundColor?: string
  orbitsControls?: boolean
  ctrlMinDist?: number
  ctrlMaxDist?: number
}

export const MultiAvatarCanvas: React.FC<MultiAvatarCanvasProps> = ({
  avatars,
  sceneUrl,
  backgroundColor = '#111',
  orbitsControls = true,
  ctrlMinDist = 3,
  ctrlMaxDist = 8,
}) => {
  const resizeRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  // On attend le premier resize avant de monter le Canvas
  useEffect(() => {
    if (!resizeRef.current) return
    const ro = new ResizeObserver(() => {
      // dès qu'on a au moins une mesure de taille, on passe ready à true
      setReady(true)
      ro.disconnect()
    })
    ro.observe(resizeRef.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={resizeRef} className="w-full h-full">
      {/*
        On ne rend le Canvas et tout son contenu
        qu'une fois ready === true
      */}
      {ready && (
        <Canvas
          className="w-full h-full"
          shadows
          camera={{ position: [0, 1, 6], fov: 30 }}
          // Optionnel : vous pouvez ici aussi forcer la taille initiale
          onCreated={({ gl }) => {
            if (resizeRef.current) {
              gl.setSize(
                resizeRef.current.clientWidth,
                resizeRef.current.clientHeight
              )
            }
          }}
        >
          <color attach="background" args={[backgroundColor]} />
          <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade />
          <ambientLight intensity={0.1} />
          <pointLight position={[5, 5, 5]} intensity={1.5} color="#ffeaaa" />
          <pointLight position={[-5, 3, -3]} intensity={1} color="#8899ff" />

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
                <AvatarWithLabels key={i} config={cfg} />
              ))}
            </group>
          </Suspense>

          <OrbitControls
            enablePan={false}
            minDistance={ctrlMinDist}
            maxDistance={ctrlMaxDist}
            target={[0, 1, 0]}
            enableRotate={orbitsControls}
          />
        </Canvas>
      )}
    </div>
  )
}
