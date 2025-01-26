import { Matrix } from '../../../lib'

import { VariableNames } from '../../../lib/constants'

import { IIRFData } from '../../use-iirf-data'

import { PartialDerivative } from './constants'

export default class DeviceKinematics {
  static dimension = 3

  static initial() {
    return new DeviceKinematics(IIRFData.initial)
  }

  constructor(iirfData) {
    this.position = iirfData.position
    this.acceleration = iirfData.acceleration
    this.angularVelocity = iirfData.angularVelocity
    this.orientation = iirfData.orientation
    this.deltaT = iirfData.deltaT
    this.refreshRates = iirfData.refreshRates
  }

  get velocity() {
    return this.position.derivativeWrtT
  }

  get jerk() {
    return this.acceleration.derivativeWrtT
  }

  get angularAcceleration() {
    return this.angularVelocity.derivativeWrtT
  }

  get angularJerk() {
    return this.angularVelocity.derivativeWrtT.derivativeWrtT
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
      [PartialDerivative.WRT_ALPHA]: new Matrix([
        [0, -this.offset.z, this.offset.y],
        [this.offset.z, 0, -this.offset.x],
        [-this.offset.y, this.offset.x, 0]
      ]),
      [PartialDerivative.WRT_OMEGA]: new Matrix([
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
      [PartialDerivative.WRT_V]: new Matrix([
        [0, -2 * this.angularVelocity.z, 2 * this.angularVelocity.y],
        [2 * this.angularVelocity.z, 0, -2 * this.angularVelocity.x],
        [-2 * this.angularVelocity.y, 2 * this.angularVelocity.x, 0]
      ]),
      [PartialDerivative.WRT_OMEGA]: new Matrix([
        [-2 * this.velocity.z, 2 * this.velocity.y, 0],
        [2 * this.velocity.z, -2 * this.velocity.x, 0],
        [0, 2 * this.velocity.x, -2 * this.velocity.y]
      ])
    }
  }

  static mapCoefficientsToStateEquationVector(coefficients) {
    return [
      coefficients[VariableNames.POSITION],
      coefficients[VariableNames.VELOCITY],
      coefficients[VariableNames.ACCELERATION],
      coefficients[VariableNames.JERK]
    ]
  }

  get generalizedPositionStateEquationVector() {
    return DeviceKinematics.mapCoefficientsToStateEquationVector({
      [VariableNames.POSITION]: 1,
      [VariableNames.VELOCITY]: this.deltaT,
      [VariableNames.ACCELERATION]: Math.pow(this.deltaT, 2) / 2,
      [VariableNames.JERK]: Math.pow(this.deltaT, 3) / 6
    })
  }

  get generalizedVelocityStateEquationVector() {
    return DeviceKinematics.mapCoefficientsToStateEquationVector({
      [VariableNames.POSITION]: 0,
      [VariableNames.VELOCITY]: 1,
      [VariableNames.ACCELERATION]: this.deltaT,
      [VariableNames.JERK]: Math.pow(this.deltaT, 2) / 2
    })
  }

  get generalizedAccelerationStateEquationVector() {
    return DeviceKinematics.mapCoefficientsToStateEquationVector({
      [VariableNames.POSITION]: 0,
      [VariableNames.VELOCITY]: 0,
      [VariableNames.ACCELERATION]: 1,
      [VariableNames.JERK]: this.deltaT
    })
  }

  get generalizedJerkStateEquationVector() {
    return DeviceKinematics.mapCoefficientsToStateEquationVector({
      [VariableNames.POSITION]: 0,
      [VariableNames.VELOCITY]: 0,
      [VariableNames.ACCELERATION]: 0,
      [VariableNames.JERK]: 1
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
      this.constructor.dimension
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

  get toString() {
    return JSON.stringify(
      {
        stateVector: this.stateVector,
        stateTransitionMatrix: this.stateTransitionMatrix
      },
      null,
      2
    )
  }
}
