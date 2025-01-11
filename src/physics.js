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

function createIdentityMatrix(dimension) {
  return Array.from({ length: dimension }, (_, i) => Array.from({ length: dimension }, (_, j) => (i === j ? 1 : 0)))
}

function createZeroMatrix(dimension) {
  return Array.from({ length: dimension }, () => Array(dimension).fill(0))
}

function createDtMatrix(dimension, deltaTime) {
  return createDiagonalMatrix(dimension, deltaTime)
}

function createDt2Matrix(dimension, deltaTime) {
  return createDiagonalMatrix(dimension, 0.5 * deltaTime * deltaTime)
}

function createDiagonalMatrix(dimension, value) {
  return Array.from({ length: dimension }, (_, i) => Array.from({ length: dimension }, (_, j) => (i === j ? value : 0)))
}

function createKinematicBlock(dimension, deltaTime) {
  const subDimension = dimension / 4
  if (dimension % 4 !== 0) {
    throw new Error('Dimension must be divisible by 4.')
  }

  const I = createIdentityMatrix(subDimension)
  const Dt = createDtMatrix(subDimension, deltaTime)
  const Dt2 = createDt2Matrix(subDimension, deltaTime)
  const Z = createZeroMatrix(subDimension)

  const createRow = (I_part, Dt_part, Dt2_part, Z_part) => I_part.map((row, i) => [...row, ...Dt_part[i], ...Dt2_part[i], ...Z_part[i]])

  return [...createRow(I, Dt, Dt2, Z), ...createRow(Z, I, Dt, Z), ...createRow(Z, Z, I, Dt), ...createRow(Z, Z, Z, I)]
}

function jacobianLeverArmOmega(omega, r) {
  return [
    [0, -2 * omega.z * r.y, 2 * omega.y * r.y + omega.y * r.z - omega.z * r.x],
    [2 * omega.z * r.x - omega.x * r.z, 0, -2 * omega.x * r.x],
    [-2 * omega.y * r.x - omega.y * r.z + omega.z * r.x, 2 * omega.x * r.y, 0]
  ]
}

function jacobianLeverArmAlpha(r) {
  return [
    [0, -r.z, r.y],
    [r.z, 0, -r.x],
    [-r.y, r.x, 0]
  ]
}

function createLeverArmBlock(dimension, omega, positionOffset) {
  const JomegaL = jacobianLeverArmOmega(omega, positionOffset)
  const JalphaL = jacobianLeverArmAlpha(positionOffset)
  return Array.from({ length: dimension }, (_, i) =>
    Array.from({ length: dimension }, (_, j) => {
      if (i < 3 && j >= 6 && j < 9) {
        return JomegaL[i][j - 6]
      } else if (i < 3 && j >= 9 && j < 12) {
        return JalphaL[i][j - 9]
      }
      return 0
    })
  )
}

function jacobianCoriolisV(omega) {
  return [
    [0, -2 * omega.z, 2 * omega.y],
    [2 * omega.z, 0, -2 * omega.x],
    [-2 * omega.y, 2 * omega.x, 0]
  ]
}

function jacobianCoriolisOmega(velocity) {
  return [
    [-2 * velocity.z, 2 * velocity.y, 0],
    [2 * velocity.z, -2 * velocity.x, 0],
    [0, 2 * velocity.x, -2 * velocity.y]
  ]
}

function createCoriolisBlock(dimension, omega, velocity) {
  const Jv = jacobianCoriolisV(omega)
  const Jomega = jacobianCoriolisOmega(velocity)
  return Array.from({ length: dimension }, (_, i) =>
    Array.from({ length: dimension }, (_, j) => {
      if (i < 3 && j >= 3 && j < 6) {
        return Jv[i][j - 3]
      } else if (i < 3 && j >= 6 && j < 9) {
        return Jomega[i][j - 6]
      }
      return 0
    })
  )
}

export function constructF(dimension, omega, velocity, deltaTime, positionOffset) {
  const kinematicBlock = createKinematicBlock(dimension, deltaTime)
  const leverArmBlock = createLeverArmBlock(dimension, omega, positionOffset)
  const coriolisBlock = createCoriolisBlock(dimension, omega, velocity)
  const F = [
    [...kinematicBlock, ...leverArmBlock],
    [...coriolisBlock, ...kinematicBlock]
  ]
  return F
}
