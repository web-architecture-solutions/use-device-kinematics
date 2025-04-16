import { PartialDerivative } from '../../../lib/physics/constants'

import { Matrix } from '../../../lib'

import { VariableNames } from '../../../lib/constants'

import { S } from '../../../lib/math'

import { IIRFData } from '../../use-iirf-data'

import { Jacobian } from '../../../lib/physics'

export default class DeviceKinematics {
  dimension = 3

  static initial() {
    return new DeviceKinematics(IIRFData.initial)
  }

  static mapCoefficientsToStateEquationVector(coefficients) {
    return [
      coefficients[VariableNames.POSITION],
      coefficients[VariableNames.VELOCITY],
      coefficients[VariableNames.ACCELERATION],
      coefficients[VariableNames.JERK]
    ]
  }

  constructor(iirfData) {
    this.position = iirfData[VariableNames.POSITION]
    this.acceleration = iirfData[VariableNames.ACCELERATION]
    this.angularVelocity = iirfData[VariableNames.ANGULAR_VELOCITY]
    this.orientation = iirfData[VariableNames.ORIENTATION]
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
    return this.angularAcceleration.derivativeWrtT
  }

  get measuredVariables() {
    return [this.position, this.acceleration, this.orientation, this.angularVelocity]
  }

  get variables() {
    return [
      this.position,
      this.velocity,
      this.acceleration,
      this.jerk,
      this.orientation,
      this.angularVelocity,
      this.angularAcceleration,
      this.angularJerk
    ]
  }

  get stateVector() {
    return this.variables.flat()
  }

  get offset() {
    const crossProduct = this.angularVelocity.cross(this.angularVelocity.cross(this.acceleration))
    const combined = this.angularAcceleration.cross(this.acceleration).add(crossProduct)
    return this.angularVelocity.magnitude() === 0 ? combined : combined.scale(1 / this.angularVelocity.magnitude() ** 2)
  }

  get motionAPINoise() {
    return 1 / this.refreshRates.motion
  }

  get geolocationAPINoise() {
    return 1 / this.refreshRates.geolocation
  }

  get orientationAPINoise() {
    return 1 / this.refreshRates.orientation
  }

  get processNoiseMatrix() {
    return Matrix.diagonal(S, this.variables.length * this.dimension)
  }

  get motionAPINoiseMatrix() {
    return Matrix.diagonal(this.motionAPINoise, this.dimension)
  }

  get geolocationAPINoiseMatrix() {
    return Matrix.diagonal(this.geolocationAPINoise, this.dimension)
  }

  get orientationAPINoiseMatrix() {
    return Matrix.diagonal(this.orientationAPINoise, this.dimension)
  }

  get zeroMatrix() {
    return Matrix.zero(this.dimension)
  }

  get observationNoiseMatrix() {
    return Matrix.block([
      [this.geolocationAPINoiseMatrix, this.zeroMatrix, this.zeroMatrix, this.zeroMatrix],
      [this.zeroMatrix, this.motionAPINoiseMatrix, this.zeroMatrix, this.zeroMatrix],
      [this.zeroMatrix, this.zeroMatrix, this.orientationAPINoiseMatrix, this.zeroMatrix],
      [this.zeroMatrix, this.zeroMatrix, this.zeroMatrix, this.motionAPINoiseMatrix]
    ])
  }

  get kinematicsMatrix() {
    return Matrix.blockDiagonal(
      [
        // Generalized position state equation
        DeviceKinematics.mapCoefficientsToStateEquationVector({
          [VariableNames.POSITION]: 1,
          [VariableNames.VELOCITY]: this.deltaT,
          [VariableNames.ACCELERATION]: Math.pow(this.deltaT, 2) / 2,
          [VariableNames.JERK]: Math.pow(this.deltaT, 3) / 6
        }),
        // Generalized velocity state equation
        DeviceKinematics.mapCoefficientsToStateEquationVector({
          [VariableNames.POSITION]: 0,
          [VariableNames.VELOCITY]: 1,
          [VariableNames.ACCELERATION]: this.deltaT,
          [VariableNames.JERK]: Math.pow(this.deltaT, 2) / 2
        }),
        // Generalized acceleration state equation
        DeviceKinematics.mapCoefficientsToStateEquationVector({
          [VariableNames.POSITION]: 0,
          [VariableNames.VELOCITY]: 0,
          [VariableNames.ACCELERATION]: 1,
          [VariableNames.JERK]: this.deltaT
        }),
        // Generalized jerk state equation
        DeviceKinematics.mapCoefficientsToStateEquationVector({
          [VariableNames.POSITION]: 0,
          [VariableNames.VELOCITY]: 0,
          [VariableNames.ACCELERATION]: 0,
          [VariableNames.JERK]: 1
        })
      ],
      this.dimension
    )
  }

  get leverArmEffectMatrix() {
    const leverArmEffectJacobian = Jacobian.leverArmEffect(this.offset, this.angularVelocity)
    const paddedJacobianWrtAlpha = leverArmEffectJacobian[PartialDerivative.WRT_ALPHA].pad({ top: 6, left: 6, bottom: 3, right: 3 })
    const paddedJacobianWrtOmega = leverArmEffectJacobian[PartialDerivative.WRT_OMEGA].pad({ top: 6, left: 6, bottom: 3, right: 3 })
    return paddedJacobianWrtAlpha.add(paddedJacobianWrtOmega)
  }

  get coriolisEffectMatrix() {
    const coriolisEffectJacobian = Jacobian.coriolisEffect(this.angularVelocity, this.velocity)
    const paddedJacobianWRTV = coriolisEffectJacobian[PartialDerivative.WRT_V].pad({ top: 6, left: 6, bottom: 3, right: 3 })
    const paddedJacobianWRTOMEGA = coriolisEffectJacobian[PartialDerivative.WRT_OMEGA].pad({ top: 6, left: 6, bottom: 3, right: 3 })
    return paddedJacobianWRTV.add(paddedJacobianWRTOMEGA)
  }

  get stateTransitionMatrix() {
    return Matrix.block([
      [this.kinematicsMatrix, this.leverArmEffectMatrix],
      [this.coriolisEffectMatrix, this.kinematicsMatrix]
    ])
  }

  get observationMatrix() {
    return Matrix.block([
      [this.getVariableObservationMatrix(this.position)],
      [this.getVariableObservationMatrix(this.acceleration)],
      [this.getVariableObservationMatrix(this.orientation)],
      [this.getVariableObservationMatrix(this.angularVelocity)]
    ])
  }

  getVariableObservationMatrix(variable) {
    const index = this.variables.indexOf(variable)
    const left = index * this.dimension
    const right = (8 - index - 1) * this.dimension
    return Matrix.identity(this.dimension).pad({ left, right })
  }

  toString() {
    return JSON.stringify(
      {
        stateVector: this.stateVector,
        stateTransitionMatrix: this.stateTransitionMatrix,
        observationMatrix: this.observationMatrix
      },
      null,
      2
    )
  }
}
