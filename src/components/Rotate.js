import { useState } from 'react'

import { useFrame } from '@react-three/fiber'

export default function Rotate({ children, callback }) {
  const [{ x, y, z }, setRotation] = useState({ x: 0, y: 0, z: 0 })

  useFrame(() => setRotation(callback))

  return <group rotation={[x, y, z]}>{children}</group>
}
