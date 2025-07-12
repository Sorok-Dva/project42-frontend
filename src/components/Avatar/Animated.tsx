import React, { useRef, useEffect, Suspense, useMemo } from 'react'
import {
  useGLTF,
  useFBX,
  useAnimations,
  Html,
  ContactShadows,
  Environment,
  Sky,
  OrbitControls,
  Stars,
} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

export function AvatarScene({ avatarUrl, animation }: { avatarUrl: string, animation: string }) {
  const group = useRef<THREE.Group>(null)
  const gltf  = useGLTF(avatarUrl)
  const fbx   = useFBX(`/assets/animations/${animation}.fbx`)

  const cleanBoneNames = useMemo(() => {
    const s = new Set<string>()
    gltf.scene.traverse(o => {
      if ((o as any).isBone) {
        // retire le préfixe éventuel
        const clean = o.name.replace(/^mixamorig/, '')
        s.add(clean)
      }
    })
    return s
  }, [gltf])

  const filteredClips = useMemo(() => {
    return fbx.animations.map(orig => {
      const copy = orig.clone()
      copy.tracks = orig.tracks.filter(t => {
        const [bone, prop] = t.name.split('.')    // ex: ["Hips","position"] ou ["Spine","quaternion"]
        // on vire seulement la translation de la Hips
        if (bone === 'Hips' && prop === 'position') return false
        // et sinon on ne garde que les os existants
        return cleanBoneNames.has(bone)
      })
      return copy
    })
  }, [fbx, cleanBoneNames])

  const { actions } = useAnimations(filteredClips, group)

  useEffect(() => {
    const a = actions[animation.split('/')[animation.split('/').length - 1]]
    if (!a) {
      console.warn(`Action "${a}" introuvable`, Object.keys(actions))
      return
    }
    a.reset().fadeIn(0.5).play()
    return () => { a.fadeOut(0.5) }
  }, [actions, animation])

  return <primitive ref={group} object={gltf.scene} dispose={null} />
}

function SceneDecor({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive
    object={scene}
    position={[0, 1.3, 0]}
    scale={0.04}
    dispose={null}
  />
}

export function AvatarCanvas({
  avatarUrl,
  animation,
  options,
  sceneUrl
}: {
  avatarUrl: string,
  animation: string,
  options?: {
    ctrlMinDist?: number,
    ctrlMaxDist?: number,
  },
  sceneUrl?: string
}) {
  return (
    <Canvas shadows camera={{ position: [0, 2, 5], fov: 30 }}>
      <color attach="background" args={['#111']} />

      {/* fond étoilé */}
      <Stars
        radius={50}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
      />

      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />

      {!sceneUrl && (
        <>
          <Sky />
          <Environment preset="sunset" />
        </>)
      }

      <Suspense fallback={<Html center>Chargement…</Html>}>
        <group position-y={-0.2}>
          {sceneUrl && <SceneDecor url={sceneUrl} />}
          <ContactShadows
            opacity={0.4}
            scale={10}
            blur={1}
            far={5}
          />
          <AvatarScene avatarUrl={avatarUrl} animation={animation} />
        </group>
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={options?.ctrlMinDist || 3}
        maxDistance={options?.ctrlMaxDist || 8}
        target={[0, 1, 0]}
      />
    </Canvas>
  )
}
