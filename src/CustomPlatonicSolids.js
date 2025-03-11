// CustomPlatonicSolids.js

// Given an array of vertices (each an array of three numbers),
// find all unique pairs that are “neighbors” – i.e. whose distance is approximately the minimum nonzero distance.
function getEdgesFromVertices(vertices, epsilon = 0.01) {
  const edges = []
  let minDist = Infinity

  // First, compute the smallest nonzero distance.
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const dx = vertices[i][0] - vertices[j][0]
      const dy = vertices[i][1] - vertices[j][1]
      const dz = vertices[i][2] - vertices[j][2]
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dist > 1e-6 && dist < minDist) {
        minDist = dist
      }
    }
  }
  // Then, add an edge if the distance is within a small factor of the minimal distance.
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const dx = vertices[i][0] - vertices[j][0]
      const dy = vertices[i][1] - vertices[j][1]
      const dz = vertices[i][2] - vertices[j][2]
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dist > 1e-6 && dist < minDist * (1 + epsilon)) {
        edges.push([i, j])
      }
    }
  }
  return edges
}

// Given a list of vertices and an edge list (pairs of indices),
// flatten into a list of numbers for a BufferGeometry.
function flattenEdges(vertices, edges) {
  const positions = []
  for (const [i, j] of edges) {
    positions.push(...vertices[i], ...vertices[j])
  }
  return positions
}

// --- Tetrahedron ---
export function getTetrahedronEdgesPositions() {
  // Use four vertices; these are taken from a common tetrahedron
  // and then normalized so that each vertex lies on the unit sphere.
  const sqrt3 = Math.sqrt(3)
  const vertices = [
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1]
  ].map((v) => v.map((coord) => coord / sqrt3))
  const edges = getEdgesFromVertices(vertices)
  return flattenEdges(vertices, edges)
}

// --- Octahedron ---
export function getOctahedronEdgesPositions() {
  // Six vertices; already lie on the unit sphere.
  const vertices = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1]
  ]
  const edges = getEdgesFromVertices(vertices)
  return flattenEdges(vertices, edges)
}

// --- Icosahedron ---
export function getIcosahedronEdgesPositions() {
  // Define 12 vertices using the golden ratio.
  const t = (1 + Math.sqrt(5)) / 2
  let vertices = [
    [-1, t, 0],
    [1, t, 0],
    [-1, -t, 0],
    [1, -t, 0],
    [0, -1, t],
    [0, 1, t],
    [0, -1, -t],
    [0, 1, -t],
    [t, 0, -1],
    [t, 0, 1],
    [-t, 0, -1],
    [-t, 0, 1]
  ]
  // Normalize each vertex.
  vertices = vertices.map((v) => {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
    return v.map((coord) => coord / len)
  })
  const edges = getEdgesFromVertices(vertices)
  return flattenEdges(vertices, edges)
}

// --- Dodecahedron ---
export function getDodecahedronEdgesPositions() {
  // Define 20 vertices using the standard construction.
  // Vertices are the 8 corners of a cube plus 12 extra points.
  const phi = (1 + Math.sqrt(5)) / 2
  const a = 1 // Cube vertex coordinate
  const b = 1 / phi // Smaller coordinate
  const c = phi // Larger coordinate

  const vertices = [
    // 8 vertices of a cube:
    [a, a, a],
    [a, a, -a],
    [a, -a, a],
    [a, -a, -a],
    [-a, a, a],
    [-a, a, -a],
    [-a, -a, a],
    [-a, -a, -a],
    // 12 vertices from (0, ±b, ±c) and cyclic permutations:
    [0, b, c],
    [0, b, -c],
    [0, -b, c],
    [0, -b, -c],
    [b, c, 0],
    [b, -c, 0],
    [-b, c, 0],
    [-b, -c, 0],
    [c, 0, b],
    [c, 0, -b],
    [-c, 0, b],
    [-c, 0, -b]
  ]
  // Normalize vertices to lie on the unit sphere.
  for (let i = 0; i < vertices.length; i++) {
    const [x, y, z] = vertices[i]
    const len = Math.sqrt(x * x + y * y + z * z)
    vertices[i] = [x / len, y / len, z / len]
  }
  const edges = getEdgesFromVertices(vertices)
  return flattenEdges(vertices, edges)
}
