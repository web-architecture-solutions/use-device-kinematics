import { Canvas } from '@react-three/fiber'

import Container from '../Container'
import Frame from '../Frame'
import Scene from '../Scene'

import { OrbitControls } from '@react-three/drei'

import { camera } from './constants'

import { useRadialMousePosition, useMouseVelocity } from './hooks'

import styles from './style.module.css'

const hue = Math.random() * 360

export default function App() {
  const { theta } = useRadialMousePosition()

  const { velocity: mouseVelocity, trapTriggered, setTrapTriggered } = useMouseVelocity({ accelerationTrapThreshold: 0.1 })

  return (
    <div className={styles.App}>
      <Container>
        <Canvas camera={camera} className={styles.Canvas} style={{ filter: `hue-rotate(${hue}deg)` }}>
          <Scene mouseVelocity={mouseVelocity} trapTriggered={trapTriggered} setTrapTriggered={setTrapTriggered} theta={0} />
          <OrbitControls />
        </Canvas>
      </Container>
    </div>
  )
}
