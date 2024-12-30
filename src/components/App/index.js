import { Canvas } from '@react-three/fiber'

import Container from '../Container'
import Frame from '../Frame'
import Scene from '../Scene'

import { camera } from './constants'

import { useRadialMousePosition, useMouseVelocity } from './hooks'

import styles from './style.module.css'

export default function App() {
  const { theta } = useRadialMousePosition()

  const { velocity: mouseVelocity, setVelocity, trapTriggered, setTrapTriggered } = useMouseVelocity({ accelerationTrapThreshold: 0.1 })

  return (
    <div className={styles.App}>
      <Container>
        <Frame>
          <Canvas camera={camera} className={styles.Canvas} style={{ filter: `hue-rotate(${theta}deg)` }}>
            <Scene
              mouseVelocity={mouseVelocity}
              setVelocity={setVelocity}
              trapTriggered={trapTriggered}
              setTrapTriggered={setTrapTriggered}
              theta={theta}
            />
          </Canvas>
        </Frame>
      </Container>
    </div>
  )
}
