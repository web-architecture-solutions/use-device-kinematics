import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing'

import { Text } from '@react-three/drei'

import { BlendFunction } from 'postprocessing'

import Rotate from '../Rotate'
import UnitCube from '../UnitCube'
import GlitchComposer from '../GlitchComposer'
import PixelationGlitch from '../PixelationGlitch'
import CameraGlitch from '../CameraGlitch'
import ChromaticAberrationGlitch from '../ChromaticAberrationGlitch'

import { rotationCallback, randomWalkParameters, glitchParameters } from './constants'

import { useEffect, useRef } from 'react'

import { useFrame } from '@react-three/fiber'

import { useGeometryBuffer } from '../RandomWalk/hooks'

import words from '../../words.json'

import { useMouseVelocity } from '../App/hooks'

const { delay, randomizeDelay, duration, intensity, randomizeDuration, pixelizationGranularity, randomizePixelizationGranularity } =
  glitchParameters

const normalizeCoordinate = (coordinate) => (coordinate + 1) / 2

function normalizeCoordinates({ x, y, z }) {
  return { x: normalizeCoordinate(x), y: normalizeCoordinate(y), z: normalizeCoordinate(z) }
}

function getIndex(coordinates) {
  const { x, y, z } = normalizeCoordinates(coordinates)
  return `${Math.round(x * 9)},${Math.round(y * 9)},${Math.round(z * 9)}`
}

function getColor(coordinates) {
  const { x, y, z } = normalizeCoordinates(coordinates)
  return `rgb(${Math.round(x * 255)},${Math.round(y * 255)},${Math.round(z * 255)})`
}

function getWords(currentPoint) {
  return words[getIndex(currentPoint)] ?? []
}

function getRandomWord(_words) {
  if (_words) {
    const index = Math.floor(Math.random() * _words.length)
    return _words[index]
  }
  return null
}

const isCoordinateNullOrUndefined = (x) => x === null || x === undefined

function isPointNullOrUndefined({ x, y, z }) {
  return isCoordinateNullOrUndefined(x) || isCoordinateNullOrUndefined(y) || isCoordinateNullOrUndefined(z)
}

export default function Scene({ text, setText }) {
  const { velocity: mouseVelocity, trapTriggered, setTrapTriggered } = useMouseVelocity({ accelerationTrapThreshold: 0.1 })

  const lineRef = useRef()

  const geometryBuffer = useGeometryBuffer(lineRef, { mouseVelocity, ...randomWalkParameters })

  useFrame(() => geometryBuffer.update())

  useEffect(() => {
    setText((previousText) => {
      const _words = getWords(geometryBuffer.currentPoint)
      const lastWord = previousText[previousText.length - 1].text
      if (previousText.length > 10000) {
        return [...previousText.slice(1), { text: getRandomWord(_words), color: getColor(geometryBuffer.currentPoint) }]
      }
      return [...previousText, { text: getRandomWord(_words), color: getColor(geometryBuffer.currentPoint) }]
    })
  }, [geometryBuffer.currentPoint])

  return (
    <>
      <Rotate callback={rotationCallback}>
        <UnitCube />

        <line ref={lineRef}>
          <bufferGeometry />

          <lineBasicMaterial vertexColors />
        </line>
      </Rotate>

      <EffectComposer>
        {/*
        <GlitchComposer
          isGlitched={trapTriggered}
          delay={delay}
          randomizeDelay={randomizeDelay}
          duration={duration}
          randomizeDuration={randomizeDuration}
          setTrapTriggered={setTrapTriggered}>
          <CameraGlitch intensity={intensity} />

          <ChromaticAberrationGlitch offset={[0, 0]} intensity={intensity} />

          <PixelationGlitch
            granularity={pixelizationGranularity}
            randomizeGranularity={randomizePixelizationGranularity}
            intensity={intensity}
          />
        </GlitchComposer>
        */}
        <Noise blendFunction={BlendFunction.SOFT_LIGHT} />

        <Bloom intensity={2} luminanceThreshold={0.0} luminanceSmoothing={1} mipmapBlur={true} />
      </EffectComposer>
    </>
  )
}
