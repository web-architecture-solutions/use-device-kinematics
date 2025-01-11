import Matrix from './Matrix'

const toRadians = (degrees) => degrees * (Math.PI / 180)

export class DeviceKinematics {
  constructor({ position, linearAcceleration, angularVelocity, orientation }, previousState, deltaT) {
    this.dimension = 3
    this.position = position
    this.linearAcceleration = linearAcceleration
    this.angularVelocity = angularVelocity
    this.orientation = orientation
    this.previous = previousState
    this.deltaT = deltaT
  }

  get haversineDistance() {
    if (
      this.position.latitude === null ||
      this.previous.position.latitude === null ||
      this.position.longitude === null ||
      this.previous.position.longitude === null
    ) {
      return { distance2D: null, distance3D, deltaLat: null, deltaLon: null, deltaAlt: null }
    }

    const R = 6371000

    const deltaLat = toRadians(this.position.latitude - this.previous.position.latitude)
    const deltaLon = toRadians(this.position.longitude - this.previous.position.longitude)
    const deltaAlt = this.position.altitude - this.previous.position.altitude

    const lat1 = toRadians(this.previous.position.latitude)
    const lat2 = toRadians(this.position.latitude)

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    const distance2D = c * R
    const distance3D = Math.sqrt(distance2D * distance2D + deltaAlt * deltaAlt)

    return {
      distance2D,
      distance3D,
      deltaLat: deltaLat * R,
      deltaLon: deltaLon * R * Math.cos((lat1 + lat2) / 2),
      deltaAlt: deltaAlt
    }
  }

  get velocityFromPosition() {
    const { distance2D, distance3D, deltaLat, deltaLon, deltaAlt } = this.haversineDistance

    const xVelocityFromPosition = deltaLon / this.deltaT
    const yVelocityFromPosition = deltaLat / this.deltaT
    const zVelocityFromPosition = deltaAlt / this.deltaT

    const totalVelocity2D = distance2D / this.deltaT
    const totalVelocity3D = distance3D / this.deltaT

    return { xVelocityFromPosition, yVelocityFromPosition, zVelocityFromPosition, totalVelocity2D, totalVelocity3D }
  }

  get leverArmJacobian() {
    return {
      wrtAlpha: new Matrix([
        [0, -this.position.offset.z, this.position.offset.y],
        [this.position.offset.z, 0, -this.position.offset.x],
        [-this.position.offset.y, this.position.offset.x, 0]
      ]),
      wrtOmega: new Matrix([
        [
          0,
          -2 * this.angularVelocity.z * this.position.offset,
          2 * this.angularVelocity.y * this.position.offset.y +
            this.angularVelocity.y * this.position.offset.z -
            this.angularVelocity.z * this.position.offset.x
        ],
        [
          2 * this.angularVelocity.z * this.position.offset.x - this.angularVelocity.x * this.position.offset.z,
          0,
          -2 * this.angularVelocity.x * this.position.offset.x
        ],
        [
          -2 * this.angularVelocity.y * this.position.offset.x -
            this.angularVelocity.y * this.position.offset.z +
            this.angularVelocity.z * this.position.offset.x,
          2 * this.angularVelocity.x * this.position.offset.y,
          0
        ]
      ])
    }
  }

  get coriolisJacobian() {
    return {
      wrtV: new Matrix([
        [0, -2 * this.angularVelocity.z, 2 * this.angularVelocity.y],
        [2 * this.angularVelocity.z, 0, -2 * this.angularVelocity.x],
        [-2 * this.angularVelocity.y, 2 * this.angularVelocity.x, 0]
      ]),
      wrtOmega: new Matrix([
        [-2 * this.velocity.z, 2 * this.velocity.y, 0],
        [2 * this.velocity.z, -2 * this.velocity.x, 0],
        [0, 2 * this.velocity.x, -2 * this.velocity.y]
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
    return Matrix.block([
      [this.identityMatrix, this.dtMatrix, this.dt2Matrix, this.zeroMatrix],
      [this.zeroMatrix, this.identityMatrix, this.dtMatrix, this.zeroMatrix],
      [this.zeroMatrix, this.zeroMatrix, this.identityMatrix, this.dtMatrix],
      [this.zeroMatrix, this.zeroMatrix, this.zeroMatrix, this.identityMatrix]
    ])
  }

  get leverArmMatrix() {
    const paddedJacobianWrtAlpha = this.leverArmJacobian.wrtAlpha.pad({ top: 0, left: 9 })
    const paddedJacobianWrtOmega = this.leverArmJacobian.wrtOmega.pad({ top: 0, left: 6 })
    return paddedJacobianWrtAlpha.add(paddedJacobianWrtOmega)
  }

  get coriolisMatrix() {
    const paddedJacobianWrtV = this.coriolisJacobian.wrtV.pad({ top: 0, left: 3 })
    const paddedJacobianWrtOmega = this.coriolisJacobian.wrtOmega.pad({ top: 0, left: 6 })
    return paddedJacobianWrtV.add(paddedJacobianWrtOmega)
  }

  get stateTransitionMatrix() {
    return Matrix.block([
      [this.kinematicsMatrix, this.leverArmMatrix],
      [this.coriolisMatrix, this.kinematicsMatrix]
    ])
  }
}
