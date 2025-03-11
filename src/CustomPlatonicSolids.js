// CustomPlatonicSolids.js

/**
 * Given an array of vertices (each an array of three numbers),
 * compute all unique pairs whose distance is within a given absolute
 * tolerance of the smallest nonzero distance.
 */
function getEdgesFromVertices(vertices, tolerance = 1e-3) {
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
  // Now add an edge if the distance differs from minDist by less than tolerance.
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const dx = vertices[i][0] - vertices[j][0]
      const dy = vertices[i][1] - vertices[j][1]
      const dz = vertices[i][2] - vertices[j][2]
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dist > 1e-6 && Math.abs(dist - minDist) < tolerance) {
        edges.push([i, j])
      }
    }
  }
  return edges
}

/**
 * Given a list of vertices and an edge list (pairs of indices),
 * flatten into a list of numbers for use with BufferGeometry.
 */
function flattenEdges(vertices, edges) {
  const positions = []
  for (const [i, j] of edges) {
    positions.push(...vertices[i], ...vertices[j])
  }
  return positions
}

// --- Tetrahedron ---
export function getTetrahedronEdgesPositions() {
  // Four vertices from a common tetrahedron, normalized.
  const sqrt3 = Math.sqrt(3)
  const vertices = [
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1]
  ].map((v) => v.map((coord) => coord / sqrt3))
  const edges = getEdgesFromVertices(vertices, 1e-3)
  return flattenEdges(vertices, edges)
}

// --- Octahedron ---
export function getOctahedronEdgesPositions() {
  // Six vertices on the unit sphere.
  const vertices = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1]
  ]
  const edges = getEdgesFromVertices(vertices, 1e-3)
  return flattenEdges(vertices, edges)
}
