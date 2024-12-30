import { Canvas } from '@react-three/fiber'

import Container from '../Container'
import Frame from '../Frame'
import Scene from '../Scene'

import { camera } from './constants'

import { useRadialMousePosition } from './hooks'

import styles from './style.module.css'

export default function App() {
  const { theta } = useRadialMousePosition()

  return (
    <div className={styles.App}>
      <Container>
        <Frame>
          <div className={styles.canvasContainer} style={{ filter: `hue-rotate(${theta}deg)` }}>
            <Canvas camera={camera} className={styles.Canvas}>
              <Scene />
            </Canvas>
          </div>
        </Frame>
      </Container>
    </div>
  )
}
