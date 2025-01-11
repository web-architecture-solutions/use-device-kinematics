const toRadians = (degrees) => degrees * (Math.PI / 180)

const sumSquares = (accumulator, component) => accumulator + Math.pow(component, 2)

const euclideanNorm = (...components) => Math.sqrt(components.reduce(sumSquares, 0))

export function calculateHaversineDistance({ latitude: latitude1, longitude: longitude1 }, { latitude: latitude2, longitude: longitude2 }) {
  const R = 6371000
  if (latitude1 === null || latitude2 === null || longitude1 === null || longitude2 === null)
    return { distance: null, deltaLat: null, deltaLon: null }

  const deltaLat = toRadians(latitude2 - latitude1)
  const deltaLon = toRadians(longitude2 - longitude1)

  const lat1 = toRadians(latitude1)
  const lat2 = toRadians(latitude2)

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return {
    distance: c * R,
    deltaLat: deltaLat * R,
    deltaLon: deltaLon * R
  }
}

export function calculateVelocityFromPosition(p1, p2, timeInterval) {
  const { distance, deltaLat, deltaLon } = calculateHaversineDistance(p1, p2)

  const xVelocityFromPosition = deltaLon / timeInterval
  const yVelocityFromPosition = deltaLat / timeInterval
  const totalVelocityFromPosition = distance / timeInterval

  return { xVelocityFromPosition, yVelocityFromPosition, totalVelocityFromPosition }
}

export function calculateTotalAccelerationFromComponents(xAcceleration, yAcceleration, zAcceleration) {
  return euclideanNorm(xAcceleration, yAcceleration, zAcceleration)
}

export function calculateJerkFromAcceleration(
  { totalAcceleration: totalAcceleration1, xAcceleration: xAcceleration1, yAcceleration: yAcceleration1, zAcceleration: zAcceleration1 },
  { totalAcceleration: totalAcceleration2, yAcceleration: xAcceleration2, yAcceleration: yAcceleration2, zAcceleration: zAcceleration2 },
  timeInterval
) {
  const xJerk = (xAcceleration2 - xAcceleration1) / timeInterval
  const yJerk = (yAcceleration2 - yAcceleration1) / timeInterval
  const zJerk = (zAcceleration2 - zAcceleration1) / timeInterval
  const totalJerk = (totalAcceleration1 - totalAcceleration2) / timeInterval
  return { xJerk, yJerk, zJerk, totalJerk }
}

export function calculateTotalAngularVelocityFromComponents(alpha, beta, gamma) {
  return euclideanNorm(alpha * (Math.PI / 180), beta * (Math.PI / 180), gamma * (Math.PI / 180))
}

////////////////////////////////////////////////////////

export class Vector3 {
  constructor(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
  }

  cross(vector) {
    return new Vector3(this.y * vector.z - this.z * vector.y, this.z * vector.x - this.x * vector.z, this.x * vector.y - this.y * vector.x)
  }

  scale(scalar) {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar)
  }

  add(vector) {
    return new Vector3(this.x + vector.x, this.y + vector.y, this.z + vector.z)
  }

  toString() {
    return `(${this.x}, ${this.y}, ${this.z})`
  }
}

export class Matrix extends Array {
  constructor(m) {
    if (Matrix.isMatrix(m)) {
      super()
      for (let i = 0; i < m.length; i++) {
        this.push([...m[i]])
      }
    } else {
      throw new Error('Data provided is not a valid matrix')
    }
  }

  static isMatrix(m) {
    if (!Array.isArray(m) || m.length === 0) return false
    const numCols = m[0].length
    return m.every((row) => Array.isArray(row) && row.length === numCols)
  }

  static constant(dimension, value) {
    return Array.from({ length: dimension }, () => Array(dimension).fill(value))
  }

  static diagonal(dimension, value) {
    return Array.from({ length: dimension }, (_, i) => Array.from({ length: dimension }, (_, j) => (i === j ? value : 0)))
  }

  static zero(dimension) {
    return Matrix.constant(dimension, 0)
  }

  static identity(dimension) {
    return Matrix.diagonal(dimension, 1)
  }

  add(matrix) {
    return this.map((row, i) => row.map((value, j) => value + matrix[i][j]))
  }

  pad(padding) {
    const sourceRows = this.length
    const sourceCols = this[0].length
    const topPad = padding.top || 0
    const bottomPad = padding.bottom || 0
    const leftPad = padding.left || 0
    const rightPad = padding.right || 0
    const targetRows = sourceRows + topPad + bottomPad
    const targetCols = sourceCols + leftPad + rightPad
    const paddedMatrix = Array.from({ length: targetRows }, (_, i) =>
      Array.from({ length: targetCols }, (_, j) => {
        return i >= topPad && i < topPad + sourceRows && j >= leftPad && j < leftPad + sourceCols ? this[i - topPad][j - leftPad] : 0
      })
    )
    return paddedMatrix
  }
}

export class Kinematics {
  constructor(currentState, previousState, deltaT) {
    this.dimension = 3
    this.current = currentState
    this.previous = previousState
    this.deltaT = deltaT
  }

  // TODO: Double-check for missing effects like angular jerk when linearizing
  // TODO: Double-check that this shouldn't use angular velocity instead of angular acceleration
  get leverArmJacobian() {
    return {
      wrtAlpha: new Matrix([
        [0, -this.current.position.offset.z, this.current.position.offset.y],
        [this.current.position.offset.z, 0, -this.current.position.offset.x],
        [-this.current.position.offset.y, this.current.position.offset.x, 0]
      ]),
      wrtOmega: new Matrix([
        [
          0,
          -2 * cangularAcceleration.z * this.current.position.offset,
          2 * this.current.angularAcceleration.y * this.current.position.offset.y +
            this.current.angularAcceleration.y * this.current.position.offset.z -
            this.current.angularAcceleration.z * this.current.position.offset.x
        ],
        [
          2 * this.current.angularAcceleration.z * this.current.position.offset.x -
            this.current.angularAcceleration.x * this.current.position.offset.z,
          0,
          -2 * this.current.angularAcceleration.x * this.current.position.offset.x
        ],
        [
          -2 * this.current.angularAcceleration.y * this.current.position.offset.x -
            this.current.angularAcceleration.y * this.current.position.offset.z +
            this.current.angularAcceleration.z * this.current.position.offset.x,
          2 * this.current.angularAcceleration.x * this.current.position.offset.y,
          0
        ]
      ])
    }
  }

  // TODO: Double check for missing effects like angular jerk
  // TODO: Double-check that this shouldn't use angular velocity instead of angular acceleration
  get coriolisJacobian() {
    return {
      wrtV: new Matrix([
        [0, -2 * this.current.angularAcceleration.z, 2 * this.current.angularAcceleration.y],
        [2 * this.current.angularAcceleration.z, 0, -2 * this.current.angularAcceleration.x],
        [-2 * this.current.angularAcceleration.y, 2 * this.current.angularAcceleration.x, 0]
      ]),
      wrtOmega: new Matrix([
        [-2 * this.current.velocity.z, 2 * this.current.velocity.y, 0],
        [2 * this.current.velocity.z, -2 * this.current.velocity.x, 0],
        [0, 2 * this.current.velocity.x, -2 * this.current.velocity.y]
      ])
    }
  }

  get zeroMatrix() {
    return Matrix.zero(this.dimension)
  }

  get identityMatrix() {
    return Matrix.identity(this.dimension)
  }

  get dtMatrix() {
    return Matrix.diagonal(this.dimension, this.deltaT)
  }

  get dt2Matrix() {
    return Matrix.diagonal(this.dimension, 0.5 * Math.pow(this.deltaT, 2))
  }

  // TODO: Double check that we haven't lost refinement in our core kinematics model per loss of more sophisticated coefficients
  get kinematicsMatrix() {
    return [
      [this.identityMatrix, this.dtMatrix, this.dt2Matrix, this.zeroMatrix],
      [this.zeroMatrix, this.identityMatrix, this.dtMatrix, this.zeroMatrix],
      [this.zeroMatrix, this.zeroMatrix, this.identityMatrix, this.dtMatrix],
      [this.zeroMatrix, this.zeroMatrix, this.zeroMatrix, this.identityMatrix]
    ]
  }

  get leverArmMatrix() {
    const omegaBlock = this.leverArmJacobian.wrtOmega.pad({ top: 0, left: 6 })
    const alphaBlock = this.leverArmJacobian.wrtAlpha.pad({ top: 0, left: 9 })
    const leverArmBlock = omegaBlock.add(alphaBlock)
    return leverArmBlock
  }

  get coriolisMatrix() {
    const JvBlock = this.coriolisJacobian.wrtV.pad({ top: 0, left: 3 })
    const JomegaBlock = this.coriolisJacobian.wrtOmega.pad({ top: 0, left: 6 })
    const coriolisBlock = JvBlock.add(JomegaBlock)
    return coriolisBlock
  }

  get stateTransitionMatrix() {
    const F = new Matrix([
      [...this.kinematicsMatrix, ...this.leverArmMatrix],
      [...this.coriolisMatrix, ...this.kinematicsMatrix]
    ])
    return F
  }
}
