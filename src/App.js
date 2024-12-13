import React from 'react'

import { Canvas } from '@react-three/fiber'

import { OrbitControls } from '@react-three/drei'

import WienerProcess from './components/WienerProcess'

export default function App() {
  return (
    <Canvas camera={{ position: [3, 3, 3], fov: 75 }} style={{ background: 'black' }}>
      <ambientLight intensity={0.5} />

      <WienerProcess />

      <OrbitControls />
    </Canvas>
  )
}
