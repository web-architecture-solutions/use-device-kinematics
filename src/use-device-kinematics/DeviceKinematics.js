import { Matrix } from '../lib/math'

class Vector3 {
  constructor(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
  }

  cross(v) {
    return new Vector3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x)
  }

  scale(scalar) {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar)
  }

  add(v) {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z)
  }

  subtract(v) {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z)
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2)
  }

  normalize() {
    const mag = this.magnitude()
    return mag === 0 ? new Vector3(0, 0, 0) : this.scale(1 / mag)
  }

  toArray() {
    return [this.x, this.y, this.z]
  }
}

export default class DeviceKinematics {
  dimension = 3

  constructor(sensorData) {
    this.position = sensorData.position
    this.acceleration = sensorData.acceleration
    this.angularVelocity = sensorData.angularVelocity
    this.orientation = sensorData.orientation
    this.deltaT = sensorData.deltaT
  }

  get offset() {
    const crossProduct = this.angularVelocity.cross(this.angularVelocity.cross(this.acceleration))
    const combined = this.angularAcceleration.cross(this.acceleration).add(crossProduct)
    return combined.scale(1 / angularVelocity.magnitude() ** 2 || 1)
  }

  get stateVector() {
    return [
      ...this.position.stateVector,
      ...this.position.derivativeWrtT.stateVector,
      ...this.acceleration.stateVector,
      ...this.acceleration.derivativeWrtT.stateVector,
      ...this.orientation.stateVector,
      ...this.angularVelocity.stateVector,
      ...this.angularVelocity.derivativeWrtT.stateVector,
      ...this.angularVelocity.derivativeWrtT.derivativeWrtT.stateVector
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
