import { Canvas } from '@react-three/fiber'

import { camera } from '../../constants'

import Scene from '../Scene'

import styles from './style.module.css'

export default function App() {
  return (
    <Canvas camera={camera} className={styles.Canvas}>
      <Scene />
    </Canvas>
  )
}
