import * as THREE from 'three'
import { initialConstraint, initialStepSize } from '../../constants'

export default class Point {
  static constraint = initialConstraint
  static stepSize = initialStepSize

  constructor(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
  }

  get coords() {
    return [this.x, this.y, this.z]
  }

  get normalized() {
    return new Point(...this.coords.map((value) => (value + 1) / 2))
  }

  get color() {
    const { r, g, b } = new THREE.Color(this.normalized.x, this.normalized.y, this.normalized.z)
    return [r, g, b]
  }

  get magnitude() {
    return Math.sqrt(this.coords.reduce((sum, coord) => sum + coord * coord, 0))
  }

  get nextPoint() {
    const constraint = this.constructor.constraint
    const newCoords = this.coords.map((coord) => this.randomStep(coord))
    const newPoint = new Point(...newCoords)

    if (constraint === 'cubical') {
      const adjustedCoords = newPoint.coords.map((coord) => {
        if (coord > 1) return 2 - coord
        if (coord < -1) return -2 - coord
        return coord
      })
      return new Point(...adjustedCoords)
    } else if (constraint === 'spherical') {
      return newPoint.magnitude > 1 ? new Point(...newPoint.coords.map((coord) => coord / newPoint.magnitude)) : newPoint
    } else if (['tetrahedral', 'octahedral', 'icosahedral', 'dodecahedral', 'durer'].includes(constraint)) {
      return Point.constrainToPolyhedron(newPoint, constraint)
    } else {
      return newPoint.magnitude > 1 ? new Point(...newPoint.coords.map((coord) => coord / newPoint.magnitude)) : newPoint
    }
  }

  randomStep(coord) {
    const randomStep = (Math.random() - 0.5) * this.constructor.stepSize
    return coord + randomStep
  }

  // Constrain a point inside a convex polyhedron by reflecting it off any faces it violates.
  static constrainToPolyhedron(point, shapeName) {
    let p = new THREE.Vector3(point.x, point.y, point.z)
    let faces = []

    if (shapeName === 'tetrahedral') {
      faces = Point.getFaces('tetrahedron')
    } else if (shapeName === 'octahedral') {
      faces = Point.getFaces('octahedron')
    } else if (shapeName === 'icosahedral') {
      faces = Point.getFaces('icosahedron')
    } else if (shapeName === 'dodecahedral') {
      faces = Point.getFaces('dodecahedron')
    } else if (shapeName === 'durer') {
      faces = Point.getFaces('durer')
    }

    const maxIterations = 10
    for (let i = 0; i < maxIterations; i++) {
      let outside = false
      for (let face of faces) {
        // A point is inside if dot((p - face.point), face.normal) <= 0.
        const d = p.clone().sub(face.point).dot(face.normal)
        if (d > 0) {
          // Reflect p across the face.
          p.sub(face.normal.clone().multiplyScalar(2 * d))
          outside = true
        }
      }
      if (!outside) break
    }
    return new Point(p.x, p.y, p.z)
  }

  // Retrieves the faces for a given shape using BufferGeometry.
  // Each face is an object with a 'normal' and a 'point' (centroid).
  static getFaces(shape) {
    let geometry
    switch (shape) {
      case 'tetrahedron':
        geometry = new THREE.TetrahedronGeometry(1)
        break
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(1)
        break
      case 'icosahedron':
        geometry = new THREE.IcosahedronGeometry(1)
        break
      case 'dodecahedron':
        geometry = new THREE.DodecahedronGeometry(1)
        break
      case 'durer':
        // Approximate Dürer's solid with a dodecahedron.
        geometry = Point.createDurerGeometry()
        break
      default:
        console.warn('Unknown shape for constraint:', shape)
        return []
    }

    // Ensure the geometry's attributes are up to date.
    geometry.computeVertexNormals()

    const faces = []
    const posAttr = geometry.attributes.position

    if (geometry.index) {
      // Indexed geometry: iterate over the index array in groups of 3.
      const indices = geometry.index.array
      for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i],
          b = indices[i + 1],
          c = indices[i + 2]
        const vA = new THREE.Vector3().fromBufferAttribute(posAttr, a)
        const vB = new THREE.Vector3().fromBufferAttribute(posAttr, b)
        const vC = new THREE.Vector3().fromBufferAttribute(posAttr, c)
        const centroid = new THREE.Vector3().addVectors(vA, vB).add(vC).divideScalar(3)
        const normal = new THREE.Vector3()
        normal.crossVectors(vB.clone().sub(vA), vC.clone().sub(vA)).normalize()
        if (centroid.dot(normal) < 0) normal.negate()
        faces.push({ normal, point: centroid })
      }
    } else {
      // Non-indexed geometry: iterate over consecutive vertices.
      for (let i = 0; i < posAttr.count; i += 3) {
        const vA = new THREE.Vector3().fromBufferAttribute(posAttr, i)
        const vB = new THREE.Vector3().fromBufferAttribute(posAttr, i + 1)
        const vC = new THREE.Vector3().fromBufferAttribute(posAttr, i + 2)
        const centroid = new THREE.Vector3().addVectors(vA, vB).add(vC).divideScalar(3)
        const normal = new THREE.Vector3()
        normal.crossVectors(vB.clone().sub(vA), vC.clone().sub(vA)).normalize()
        if (centroid.dot(normal) < 0) normal.negate()
        faces.push({ normal, point: centroid })
      }
    }
    return faces
  }

  // Creates an approximate geometry for Dürer's solid.
  // Currently approximated with a dodecahedron; replace with custom geometry if desired.
  static createDurerGeometry() {
    return new THREE.DodecahedronGeometry(1)
  }
}
