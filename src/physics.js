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
  constructor(currentState, previousState) {
    this.current = currentState
    this.previous = previousState
  }

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

  static dtMatrix(dimension, deltaTime) {
    return Matrix.diagonal(dimension, deltaTime)
  }

  static dt2Matrix(dimension, deltaTime) {
    return Matrix.diagonal(dimension, 0.5 * deltaTime * deltaTime)
  }

  static kinematicsMatrix(deltaTime) {
    return [
      [Matrix.identity(3), Kinematics.matrix.dt(3, deltaTime), Kinematics.matrix.dt2(3, deltaTime), Matrix.zero(3)],
      [Matrix.zero(3), Matrix.identity(3), Kinematics.matrix.dt(3, deltaTime), Matrix.zero(3)],
      [Matrix.zero(3), Matrix.zero(3), Matrix.identity(3), Kinematics.matrix.dt(3, 0)],
      [Matrix.zero(3), Matrix.zero(3), Matrix.zero(3), Matrix.identity(3)]
    ]
  }

  static leverArmMatrix(omega, positionOffset) {
    const jacobian = Kinematics.effect.leverArm.calculateJacobian(omega, positionOffset)
    const JomegaLBlock = jacobian.wrtOmega.pad({ top: 0, left: 6 })
    const JalphaLBlock = jacobian.wrtAlpha.pad({ top: 0, left: 9 })
    const leverArmBlock = JomegaLBlock.add(JalphaLBlock)
    return leverArmBlock
  }

  static coriolisMatrix(omega, velocity) {
    const jacobian = Kinematics.effect.coriolis.calculateJacobian(omega, velocity)
    const JvBlock = jacobian.wrtV.pad({ top: 0, left: 3 })
    const JomegaBlock = jacobian.wrtOmega.pad({ top: 0, left: 6 })
    const coriolisBlock = JvBlock.add(JomegaBlock)
    return coriolisBlock
  }

  static get effect() {
    return {
      coriolis: { calculateJacobian: Matrix.calculateCoriolisJacobian },
      leverArm: { calculateJacobian: Matrix.calculateLeverArmJacobian }
    }
  }

  static get matrix() {
    return {
      dt: Kinematics.dtMatrix,
      dt2: Kinematics.dt2Matrix,
      kinematics: Kinematics.kinematicsMatrix,
      leverArm: Kinematics.leverArmMatrix,
      coriolis: Kinematics.coriolisMatrix
    }
  }

  static stateTransitionMatrix(omega, velocity, positionOffset, deltaTime) {
    const kinematicMatrix = Kinematics.matrix.kinematics(deltaTime)
    const leverArmMatrix = Kinematics.matrix.leverArm(omega, positionOffset)
    const coriolisMatrix = Kinematics.matrix.coriolis(omega, velocity)
    const F = new Matrix([
      [...kinematicMatrix, ...leverArmMatrix],
      [...coriolisMatrix, ...kinematicMatrix]
    ])
    return F
  }
}
