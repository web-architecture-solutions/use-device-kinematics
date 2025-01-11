export class Kinematics {
  constructor(currentState, previousState, deltaT) {
    this.dimension = 3
    this.current = currentState
    this.previous = previousState
    this.deltaT = deltaT
  }

  // TODO: Double-check for missing effects like angular jerk when linearizing
  // TODO: Double-check that this shouldn't use angular velocity instead of angular acceleration
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

  // TODO: Double check for missing effects like angular jerk
  // TODO: Double-check that this shouldn't use angular velocity instead of angular acceleration
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
    return [
      [this.identityMatrix, this.dtMatrix, this.dt2Matrix, this.zeroMatrix],
      [this.zeroMatrix, this.identityMatrix, this.dtMatrix, this.zeroMatrix],
      [this.zeroMatrix, this.zeroMatrix, this.identityMatrix, this.dtMatrix],
      [this.zeroMatrix, this.zeroMatrix, this.zeroMatrix, this.identityMatrix]
    ]
  }

  get leverArmMatrix() {
    const omegaBlock = this.leverArmJacobian.wrtOmega.pad({ top: 0, left: 6 })
    const alphaBlock = this.leverArmJacobian.wrtAlpha.pad({ top: 0, left: 9 })
    const leverArmBlock = omegaBlock.add(alphaBlock)
    return leverArmBlock
  }

  get coriolisMatrix() {
    const vBlock = this.coriolisJacobian.wrtV.pad({ top: 0, left: 3 })
    const omegaBlock = this.coriolisJacobian.wrtOmega.pad({ top: 0, left: 6 })
    const coriolisBlock = vBlock.add(omegaBlock)
    return coriolisBlock
  }

  get stateTransitionMatrix() {
    const F = new Matrix([
      [...this.kinematicsMatrix, ...this.leverArmMatrix],
      [...this.coriolisMatrix, ...this.kinematicsMatrix]
    ])
    return F
  }
}
