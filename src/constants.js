import * as THREE from 'three'

export const initialConstraint = 'cubical'
export const initialMaxPoints = 20000
export const initialStepSize = 0.1

export const edges = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0], // Back face
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4], // Front face
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7] // Connecting edges
]

export const vertices = [
  [-1, -1, -1], // 0
  [1, -1, -1], // 1
  [1, 1, -1], // 2
  [-1, 1, -1], // 3
  [-1, -1, 1], // 4
  [1, -1, 1], // 5
  [1, 1, 1], // 6
  [-1, 1, 1] // 7
]

export const vertexColors = [
  new THREE.Color('black'),
  new THREE.Color('red'),
  new THREE.Color('yellow'),
  new THREE.Color('green'),
  new THREE.Color('blue'),
  new THREE.Color('magenta'),
  new THREE.Color('white'),
  new THREE.Color('cyan')
]
