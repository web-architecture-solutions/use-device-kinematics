import Variable from '../lib/variables/Variable'

import { Matrix } from '../lib/math'

import { haversineDistance } from '../lib/physics'

export default class DeviceKinematics {
  dimension = 3

  constructor(sensorData) {
    this.position = sensorData.position
    this.accelerationSensorData = sensorData.acceleration
    this.angularVelocitySensorData = sensorData.angularVelocity
    this.orientation = sensorData.orientation
    this.deltaT = sensorData.deltaT
  }

  derivativeWrtT(delta) {
    return delta / this.deltaT
  }

  deriveVelocityFromPosition(variable) {
    const displacement = haversineDistance(variable, variable.previous)
    const displacementToVelocity = ([component, delta]) => [component, this.derivativeWrtT(delta)]
    return new Variable(Object.fromEntries(Object.entries(displacement).map(displacementToVelocity)), {})
  }

  _derivativesWrtT(variable) {
    return new Variable(
      Object.fromEntries(
        Object.entries(variable).map(([name, value]) => {
          const delta = value - variable.previous[name]
          return [name, this.derivativeWrtT(delta)]
        })
      ),
      {}
    )
  }

  derivativesWrtT(variable) {
    if (variable && variable.previous) {
      return variable === this.position ? this.deriveVelocityFromPosition(variable) : this._derivativesWrtT(variable)
    }
    return {}
  }

  get velocityFromPosition() {
    return this.derivativesWrtT(this.position)
  }

  get acceleration() {
    return this.accelerationSensorData
  }

  get jerkFromAcceleration() {
    return this.accelerationSensorData.derivativesWrtT
  }

  get angularVelocity() {
    return this.angularVelocitySensorData
  }

  get angularAccelerationFromVelocity() {
    return this.derivativesWrtT(this.angularVelocity)
  }

  get angularJerkFromAcceleration() {
    return this.derivativesWrtT(this.angularAccelerationFromVelocity)
  }

  get stateVector() {
    return [
      this.deltaT, // DEBUG
      this.position,
      this.velocityFromPosition,
      this.acceleration,
      this.jerkFromAcceleration,
      this.orientation,
      this.angularVelocity,
      this.angularAccelerationFromVelocity,
      this.angularJerkFromAcceleration
    ]
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

  // TODO: Double check that we haven't lost refinement in our core kinematics model per loss of more sophisticated coefficients
  get kinematicsMatrix() {
    return Matrix.blockDiagonal(
      [
        [1, this.deltaT, 0.5 * Math.pow(this.deltaT, 2), 0],
        [0, 1, this.deltaT, 0],
        [0, 0, 1, this.deltaT],
        [0, 0, 0, 1]
      ],
      this.dimension
    )
  }

  get leverArmEffectMatrix() {
    const paddedJacobianWrtAlpha = this.leverArmEffectJacobian.wrtAlpha.pad({ top: 0, left: 9 })
    const paddedJacobianWrtOmega = this.leverArmEffectJacobian.wrtOmega.pad({ top: 0, left: 6 })
    return paddedJacobianWrtAlpha.add(paddedJacobianWrtOmega)
  }

  get coriolisEffectMatrix() {
    const paddedJacobianWrtV = this.coriolisEffectJacobian.wrtV.pad({ top: 0, left: 3 })
    const paddedJacobianWrtOmega = this.coriolisEffectJacobian.wrtOmega.pad({ top: 0, left: 6 })
    return paddedJacobianWrtV.add(paddedJacobianWrtOmega)
  }

  get stateTransitionMatrix() {
    return Matrix.block([
      [this.kinematicsMatrix, this.leverArmEffectMatrix],
      [this.coriolisEffectMatrix, this.kinematicsMatrix]
    ])
  }
}
