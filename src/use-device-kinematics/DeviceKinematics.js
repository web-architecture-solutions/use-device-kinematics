import { Matrix, Vector3 } from '../math'

export default class DeviceKinematics {
  dimension = 3

  constructor(sensorData) {
    this.position = sensorData.position
    this.acceleration = sensorData.acceleration
    this.angularVelocity = sensorData.angularVelocity
    this.orientation = sensorData.orientation
    this.deltaT = sensorData.deltaT
  }

  get velocity() {
    return this.position.derivativeWrtT ?? new Vector3(null, null, null)
  }

  get jerk() {
    return this.acceleration.derivativeWrtT ?? new Vector3(null, null, null)
  }

  get angularAcceleration() {
    return this.angularVelocity.derivativeWrtT ?? new Vector3(null, null, null)
  }

  get angularJerk() {
    return this.angularAcceleration.derivativeWrtT ?? new Vector3(null, null, null)
  }

  get offset() {
    const crossProduct = this.angularVelocity.cross(this.angularVelocity.cross(this.acceleration))
    const combined = this.angularAcceleration.cross(this.acceleration).add(crossProduct)
    return combined.scale(1 / this.angularVelocity.magnitude() ** 2 || 1)
  }

  get stateVector() {
    return this.stateTransitionMatrix
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

  static mapCoefficientsToStateEquationVector({ position, velocity, acceleration, jerk }) {
    return [position, velocity, acceleration, jerk]
  }

  get generalizedPositionStateEquationVector() {
    return DeviceKinematics.mapCoefficientsToStateEquationVector({
      position: 1,
      velocity: this.deltaT,
      acceleration: 0.5 * Math.pow(this.deltaT, 2),
      jerk: (1 / 6) * Math.pow(this.deltaT, 3)
    })
  }

  get generalizedVelocityStateEquationVector() {
    return DeviceKinematics.mapCoefficientsToStateEquationVector({
      position: 0,
      velocity: 1,
      acceleration: this.deltaT,
      jerk: 0.5 * Math.pow(this.deltaT, 2)
    })
  }

  get generalizedAccelerationStateEquationVector() {
    return DeviceKinematics.mapCoefficientsToStateEquationVector({
      position: 0,
      velocity: 0,
      acceleration: 1,
      jerk: this.deltaT
    })
  }

  get generalizedJerkStateEquationVector() {
    return DeviceKinematics.mapCoefficientsToStateEquationVector({
      position: 0,
      velocity: 0,
      acceleration: 0,
      jerk: 1
    })
  }

  get kinematicsMatrix() {
    return Matrix.blockDiagonal(
      [
        this.generalizedPositionStateEquationVector,
        this.generalizedVelocityStateEquationVector,
        this.generalizedAccelerationStateEquationVector,
        this.generalizedJerkStateEquationVector
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
