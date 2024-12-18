import * as THREE from 'three'

export const edges = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7]
]

export const vertices = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1]
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
