import { useState } from 'react'

import { Canvas } from '@react-three/fiber'

import Container from '../Container'
import Frame from '../Frame'
import Scene from '../Scene'

import { camera } from './constants'

import { useRadialMousePosition, useMouseVelocity } from './hooks'

import styles from './style.module.css'

function Text({ text }) {
  return (
    <div className={styles.text}>
      <div className={styles.inner}>
        {text.map(({ text: _text, color }, index) =>
          _text ? (
            <span key={index} style={{ color: color }}>
              {_text}&nbsp;
            </span>
          ) : null
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [text, setText] = useState([' '])
  //const { theta } = useRadialMousePosition()

  console.log('foo')
  return (
    <div className={styles.App}>
      <Container>
        <Frame>
          <Canvas camera={camera} className={styles.Canvas}>
            <Scene text={text} setText={setText} />
          </Canvas>
        </Frame>

        <Text text={text} />
      </Container>
    </div>
  )
}
