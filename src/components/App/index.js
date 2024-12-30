import { Canvas } from '@react-three/fiber'

import Container from '../Container'
import Frame from '../Frame'
import Scene from '../Scene'

import { camera } from './constants'

import styles from './style.module.css'

export default function App() {
  return (
    <div className={styles.App}>
      <Container>
        <Frame>
          <Canvas camera={camera} className={styles.Canvas}>
            <Scene />
          </Canvas>
        </Frame>
      </Container>
    </div>
  )
}
