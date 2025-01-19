import { Matrix } from '../lib/math'

import Vector3 from '../lib/math/Vector3'

export default class DeviceKinematics {
  dimension = 3

  constructor(sensorData) {
    this.position = sensorData.position ?? new Vector3(null, null, null)
    this.acceleration = sensorData.acceleration ?? new Vector3(null, null, null)
    this.angularVelocity = sensorData.angularVelocity ?? new Vector3(null, null, null)
    this.orientation = sensorData.orientation ?? new Vector3(null, null, null)
    this.deltaT = sensorData.deltaT
  }

  get velocity() {
    return this.position?.derivativeWrtT ?? new Vector3(null, null, null)
  }

  get jerk() {
    return this.acceleration?.derivativeWrtT ?? new Vector3(null, null, null)
  }

  get angularAcceleration() {
    return this.angularVelocity?.derivativeWrtT ?? new Vector3(null, null, null)
  }

  get angularJerk() {
    return this.angularAcceleration?.derivativeWrtT ?? new Vector3(null, null, null)
  }

  get offset() {
    const crossProduct = this.angularVelocity.cross(this.angularVelocity.cross(this.acceleration))
    const combined = this.angularAcceleration.cross(this.acceleration).add(crossProduct)
    return combined.scale(1 / this.angularVelocity.magnitude() ** 2 || 1)
  }

  get stateVector() {
    return [
      ...this.position,
      ...this.velocity,
      ...this.acceleration,
      ...this.jerk,
      ...this.orientation,
      ...this.angularVelocity,
      ...this.angularAcceleration,
      ...this.angularJerk
    ]
  }

  get leverArmEffectJacobian() {
    return {
      wrtAlpha: new Matrix([
        [0, -this.offset.z, this.offset.y],
        [this.offset.z, 0, -this.offset.x],
        [-this.offset.y, this.offset.x, 0]
      ]),
      wrtOmega: new Matrix([
        [
          0,
          -2 * this.angularVelocity.z * this.offset.z,
          2 * this.angularVelocity.y * this.offset.y + this.angularVelocity.y * this.offset.z - this.angularVelocity.z * this.offset.x
        ],
        [
          2 * this.angularVelocity.z * this.offset.x - this.angularVelocity.x * this.offset.z,
          0,
          -2 * this.angularVelocity.x * this.offset.x
        ],
        [
          -2 * this.angularVelocity.y * this.offset.x - this.angularVelocity.y * this.offset.z + this.angularVelocity.z * this.offset.x,
          2 * this.angularVelocity.x * this.offset.y,
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

  get kinematicsMatrix() {
    return Matrix.blockDiagonal(
      [
        [1, deltaT, 0.5 * Math.pow(deltaT, 2), (1 / 6) * Math.pow(deltaT, 3)], // Position
        [0, 1, deltaT, 0.5 * Math.pow(deltaT, 2)], // Velocity
        [0, 0, 1, deltaT], // Acceleration
        [0, 0, 0, 1] // Jerk (constant)
      ],
      this.dimension
    )
  }

  get leverArmEffectMatrix() {
    const paddedJacobianWrtAlpha = this.leverArmEffectJacobian.wrtAlpha.pad({ top: 0, left: 9 })
    const paddedJacobianWrtOmega = this.leverArmEffectJacobian.wrtOmega.pad({ top: 0, left: 9 })
    return paddedJacobianWrtAlpha.add(paddedJacobianWrtOmega)
  }

  get coriolisEffectMatrix() {
    const paddedJacobianWrtV = this.coriolisEffectJacobian.wrtV.pad({ top: 0, left: 9 })
    const paddedJacobianWrtOmega = this.coriolisEffectJacobian.wrtOmega.pad({ top: 0, left: 9 })
    return paddedJacobianWrtV.add(paddedJacobianWrtOmega)
  }

  get stateTransitionMatrix() {
    return Matrix.block([
      [this.kinematicsMatrix, this.leverArmEffectMatrix],
      [this.coriolisEffectMatrix, this.kinematicsMatrix]
    ])
  }
}
