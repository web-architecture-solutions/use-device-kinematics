import { useRef, useState } from 'react'

import { useFrame } from '@react-three/fiber'

import { Text } from '@react-three/drei'

import { useGeometryBuffer } from './hooks'

import words from '../../words.json'

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

function getRandomWord(currentPoint) {
  const _words = words[getIndex(currentPoint)]
  if (_words) {
    const index = Math.floor(Math.random() * _words.length)
    return _words[index]
  }
  return null
}

export default function RandomWalk({ parameters }) {
  const [currentPoint, setCurrentPoint] = useState({ x: null, y: null, z: null })

  const lineRef = useRef()
  const geometryBuffer = useGeometryBuffer(lineRef, parameters)

  useFrame(() => {
    geometryBuffer.update()
    setCurrentPoint(geometryBuffer.currentPoint)
  })

  return (
    <>
      {/*
      <line ref={lineRef}>
        <bufferGeometry />

        <lineBasicMaterial vertexColors />
      </line>
      */}

      <Text color={getColor(currentPoint)} fontSize={0.2} position={[currentPoint.x, currentPoint.y, currentPoint.z]}>
        {getRandomWord(currentPoint)}
      </Text>
    </>
  )
}
