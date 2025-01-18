import { Matrix } from '../lib/math'

export default class DeviceKinematics {
  dimension = 3

  #position
  #acceleration
  #angularVelocity
  #orientation

  constructor(sensorData) {
    this.#position = sensorData.position
    this.#acceleration = sensorData.acceleration
    this.#angularVelocity = sensorData.angularVelocity
    this.#orientation = sensorData.orientation
    this.deltaT = sensorData.deltaT
  }

  get position() {
    return this.#position ?? [null, null, null]
  }

  get velocity() {
    return this.position?.derivativeWrtT ?? [null, null, null]
  }

  get acceleration() {
    return this.#acceleration ?? [null, null, null]
  }

  get jerk() {
    return this.acceleration?.derivativeWrtT ?? [null, null, null]
  }

  get orientation() {
    return this.#orientation ?? [null, null, null]
  }

  get angularVelocity() {
    return this.#angularVelocity ?? [null, null, null]
  }

  get angularAcceleration() {
    return this.angularVelocity?.derivativeWrtT ?? [null, null, null]
  }

  get angularJerk() {
    return this.angularAcceleration?.derivativeWrtT ?? [null, null, null]
  }

  get offset() {
    const crossProduct = this.angularVelocity.cross?.(this.angularVelocity.cross?.(this.acceleration))
    const combined = this.angularAcceleration.cross?.(this.acceleration).add(crossProduct)
    return combined?.scale?.(1 / this.angularVelocity?.magnitude() ** 2 || 1)
  }

  get stateVector() {
    return this.offset
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
    if (this.offset && this.angularVelocity) {
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
    return {}
  }

  get coriolisEffectJacobian() {
    if (this.angularVelocity && this.velocity) {
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
    return {}
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
