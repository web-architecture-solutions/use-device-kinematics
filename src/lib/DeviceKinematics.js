import { toRadians, euclideanNorm, Matrix } from './math'

import { haversineDistance } from './physics'

export default class DeviceKinematics {
  constructor(sensorData, deltaT) {
    this.dimension = 3
    this.sensorData = sensorData
    this.position = sensorData.position
    this.accelerationSensorData = sensorData.acceleration
    this.angularVelocitySensorData = sensorData.angularVelocity
    this.orientation = sensorData.orientation
    this.deltaT = deltaT
  }

  derivativeWrtT(delta) {
    return delta / this.deltaT
  }

  deriveVelocityFromPosition(current, previous) {
    const displacement = haversineDistance(current, previous)
    const displacementToVelocity = ([component, delta]) => [component, this.derivativeWrtT(delta)]
    return Object.fromEntries(Object.entries(displacement).map(displacementToVelocity))
  }

  _derivativesWrtT(current, previous) {
    return Object.fromEntries(
      Object.entries(current).map(([component, value]) => {
        const delta = value - previous[component]
        return [component, this.derivativeWrtT(delta)]
      })
    )
  }

  derivativesWrtT(variable) {
    if (variable.current && variable.previous) {
      return variable === this.position
        ? this.deriveVelocityFromPosition(variable.current, variable.previous)
        : this._derivativesWrtT(variable.current, variable.previous)
    }
    return {}
  }

  get velocityFromPosition() {
    return this.derivativesWrtT(this.position)
  }

  get acceleration() {
    return {
      ...this.accelerationSensorData,
      xy: euclideanNorm(this.accelerationSensorData.x, this.accelerationSensorData.y),
      xyz: euclideanNorm(this.accelerationSensorData.x, this.accelerationSensorData.y, this.accelerationSensorData.z)
    }
  }

  get jerkFromAcceleration() {
    return this.derivativesWrtT(this.acceleration)
  }

  get angularVelocity() {
    return {
      ...this.angularVelocitySensorData,
      xy: euclideanNorm(toRadians(this.angularVelocitySensorData.x), toRadians(this.angularVelocitySensorData.y)),
      xyz: euclideanNorm(
        toRadians(this.angularVelocitySensorData.z),
        toRadians(this.angularVelocitySensorData.x),
        toRadians(this.angularVelocitySensorData.y)
      )
    }
  }

  get angularAccelerationFromVelocity() {
    return this.derivativesWrtT(this.angularVelocity)
  }

  get angularJerkFromAcceleration() {
    return this.derivativesWrtT(this.angularAccelerationFromVelocity)
  }

  get stateVector() {
    return [this.position, this.velocityFromPosition, this.acceleration, this.orientation, this.angularVelocity]
  }

  get leverArmEffectJacobian() {
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

  get coriolisEffectJacobian() {
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
    const paddedJacobianWrtAlpha = this.leverArmEffectJacobian.wrtAlpha.pad({ top: 0, left: 9 })
    const paddedJacobianWrtOmega = this.leverArmEffectJacobian.wrtOmega.pad({ top: 0, left: 6 })
    return paddedJacobianWrtAlpha.add(paddedJacobianWrtOmega)
  }

  get coriolisMatrix() {
    const paddedJacobianWrtV = this.coriolisEffectJacobian.wrtV.pad({ top: 0, left: 3 })
    const paddedJacobianWrtOmega = this.coriolisEffectJacobian.wrtOmega.pad({ top: 0, left: 6 })
    return paddedJacobianWrtV.add(paddedJacobianWrtOmega)
  }

  get stateTransitionMatrix() {
    return Matrix.block([
      [this.kinematicsMatrix, this.leverArmMatrix],
      [this.coriolisMatrix, this.kinematicsMatrix]
    ])
  }
}
