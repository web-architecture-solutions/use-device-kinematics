import Variable from '../lib/variables/Variable'

import Position from '../lib/variables/Position'
import Acceleration from '../lib/variables/Acceleration'
import Orientation from '../lib/variables/Orientation'
import AngularVelocity from '../lib/variables/AngularVelocity'
import Velocity from '../lib/variables/Velocity'
import Jerk from '../lib/variables/Jerk'
import AngularAcceleration from '../lib/variables/AngularAcceleration'
import AngularJerk from '../lib/variables/AngularJerk'

import { VariableNames } from './constants'

const VariableConstructors = {
  [VariableNames.POSITION]: Position,
  [VariableNames.VELOCITY]: Velocity,
  [VariableNames.ACCELERATION]: Acceleration,
  [VariableNames.JERK]: Jerk,
  [VariableNames.ORIENTATION]: Orientation,
  [VariableNames.ANGULAR_VELOCITY]: AngularVelocity,
  [VariableNames.ANGULAR_ACCELERATION]: AngularAcceleration,
  [VariableNames.ANGULAR_JERK]: AngularJerk
}

export default class SensorData {
  #timestamp
  #previousTimestamp
  #previousDerivativesWrtT

  constructor(rawSensorData, previousRawSensorData, previousDerivativesWrtT, timestamp, previousTimestamp) {
    this.#timestamp = timestamp
    this.#previousTimestamp = previousTimestamp
    this.#previousDerivativesWrtT = previousDerivativesWrtT

    Object.entries(rawSensorData).forEach(([variableName, rawVariableState]) => {
      const previousRawVariableState = previousRawSensorData?.[variableName] ?? {}
      const previousVariableDerivativesWrtT = previousDerivativesWrtT?.[variableName] ?? {}
      const constructor = SensorData.getVariableConstructorByName(variableName)
      this[variableName] = new constructor(rawVariableState, previousRawVariableState, previousVariableDerivativesWrtT, constructor, this)
    })
  }

  static get initial() {
    return Object.fromEntries(
      Object.entries(VariableConstructors).map(([variableName, variableConstructor]) => {
        return [variableName, variableConstructor.initial]
      })
    )
  }

  get isReady() {
    return !this.isEqual(SensorData.initial)
  }

  get timestamp() {
    return this.#timestamp
  }

  get previousTimestamp() {
    return this.#previousTimestamp
  }

  get derivativesWrtT() {
    const _derivativesWrtT = this.reduce((derivatives, [_, variable]) => {
      return variable.hasDerivative ? [...derivatives, [variable.derivativeName, variable.derivativeWrtT]] : derivatives
    })

    return new SensorData(_derivativesWrtT, this.#previousDerivativesWrtT, {}, this.#timestamp, this.#previousTimestamp)
  }

  static getVariableConstructorByName(variableName) {
    return VariableConstructors[variableName]
  }

  static isEqual(sensorData1, sensorData2) {
    return sensorData1.every(([variableName, variableData]) => {
      return Variable.isEqual(variableData, sensorData2?.[variableName])
    })
  }

  every(callback) {
    Object.entries(this).every(callback)
  }

  reduce(reducer) {
    return Object.fromEntries(Object.entries(this).reduce(reducer, []))
  }

  isEqual(sensorData) {
    return SensorData.isEqual(this, sensorData)
  }
}
