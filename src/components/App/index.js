import { Canvas } from '@react-three/fiber'

import Frame from '../Frame'
import Scene from '../Scene'

import { camera } from './constants'

import styles from './style.module.css'

export default function App() {
  return (
    <div className={styles.App}>
      <Frame>
        <div className={styles.canvasContainer}>
          <Canvas camera={camera} className={styles.Canvas}>
            <Scene />
          </Canvas>
        </div>
      </Frame>
    </div>
  )
}
