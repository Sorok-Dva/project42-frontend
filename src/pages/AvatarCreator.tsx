import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

interface AvatarProps {
  skinColor: string
  hairColor: string
  hairStyle: 'none' | 'short' | 'long'
  showMoustache: boolean
}

const Avatar: React.FC<AvatarProps> = ({ skinColor, hairColor, hairStyle, showMoustache }) => (
  <group>
    {/* Body */}
    <mesh position={[0, -1, 0]}>
      <cylinderGeometry args={[0.8, 0.8, 2, 32]} />
      <meshStandardMaterial color="#2b2d42" />
    </mesh>
    {/* Head */}
    <mesh position={[0, 1.4, 0]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={skinColor} />
    </mesh>
    {/* Hair */}
    {hairStyle !== 'none' && (
      <mesh position={[0, 2.1, 0]} scale={[1.1, hairStyle === 'short' ? 0.5 : 1, 1.1]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
    )}
    {/* Moustache */}
    {showMoustache && (
      <mesh position={[0, 1.1, 0.9]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.1]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
    )}
  </group>
)

const AvatarCreator: React.FC = () => {
  const [skinColor, setSkinColor] = useState('#ffdbac')
  const [hairColor, setHairColor] = useState('#502314')
  const [hairStyle, setHairStyle] = useState<'none' | 'short' | 'long'>('short')
  const [showMoustache, setShowMoustache] = useState(false)

  return (
    <div className="p-4 grid gap-4 md:grid-cols-2">
      <div className="h-96 bg-gray-900 rounded">
        <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 5, 2]} />
          <Avatar
            skinColor={skinColor}
            hairColor={hairColor}
            hairStyle={hairStyle}
            showMoustache={showMoustache}
          />
          <OrbitControls enablePan={false} />
        </Canvas>
      </div>
      <div className="space-y-4 text-white">
        <div>
          <label className="block mb-1">Couleur de peau</label>
          <input
            type="color"
            value={skinColor}
            onChange={(e) => setSkinColor(e.target.value)}
            className="w-16 h-8 p-0 border-none"
          />
        </div>
        <div>
          <label className="block mb-1">Coiffure</label>
          <select
            value={hairStyle}
            onChange={(e) => setHairStyle(e.target.value as 'none' | 'short' | 'long')}
            className="text-black rounded p-1"
          >
            <option value="none">Aucune</option>
            <option value="short">Courts</option>
            <option value="long">Longs</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Couleur des cheveux</label>
          <input
            type="color"
            value={hairColor}
            onChange={(e) => setHairColor(e.target.value)}
            className="w-16 h-8 p-0 border-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="moustache"
            type="checkbox"
            checked={showMoustache}
            onChange={(e) => setShowMoustache(e.target.checked)}
          />
          <label htmlFor="moustache">Moustache</label>
        </div>
      </div>
    </div>
  )
}

export default AvatarCreator
