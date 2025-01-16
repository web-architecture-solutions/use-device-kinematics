import { Matrix } from '../lib/math'

export default class DeviceKinematics {
  dimension = 3

  constructor(sensorData) {
    this.position = sensorData.position
    this.acceleration = sensorData.acceleration
    this.angularVelocity = sensorData.angularVelocity
    this.orientation = sensorData.orientation
    this.deltaT = sensorData.deltaT
  }

  get velocityFromPosition() {
    return this.position.derivativesWrtT
  }

  get jerkFromAcceleration() {
    return this.acceleration.derivativesWrtT
  }

  get angularAccelerationFromVelocity() {
    return this.angularVelocity.derivativesWrtT
  }

  get angularJerkFromAcceleration() {
    return this.angularAccelerationFromVelocity.derivativesWrtT
  }

  get stateVector() {
    return [
      ...this.position.stateVector,
      ...this.velocityFromPosition.stateVector,
      ...this.acceleration.stateVector,
      ...this.jerkFromAcceleration.stateVector,
      ...this.orientation.stateVector,
      ...this.angularVelocity.stateVector,
      ...this.angularAccelerationFromVelocity.stateVector
      //...this.angularJerkFromAcceleration.stateVector
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
