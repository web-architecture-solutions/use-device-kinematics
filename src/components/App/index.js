import { Canvas } from '@react-three/fiber'

import { useTheta } from './hooks'

import Frame from '../Frame'
import Scene from '../Scene'

import { camera } from './constants'

import styles from './style.module.css'

export default function App() {
  const theta = useTheta()

  return (
    <div className={styles.App}>
      <Frame>
        <Canvas camera={camera} className={styles.Canvas} style={{ filter: `hue-rotate(${theta}deg)` }}>
          <Scene theta={theta} />
        </Canvas>
      </Frame>
    </div>
  )
}
