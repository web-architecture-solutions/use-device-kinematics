import Variable from '../lib/variables/Variable'

import { VariableNames, VariableConstructors } from './constants'

export default class SensorData {
  #timestamp
  #previousTimestamp

  constructor(rawSensorData, previousRawSensorData, previousDerivativesWrtT, timestamp, previousTimestamp) {
    this.#timestamp = timestamp
    this.#previousTimestamp = previousTimestamp

    Object.entries(rawSensorData).forEach(([variableName, rawVariableState]) => {
      const previousRawVariableState = previousRawSensorData?.[variableName] ?? {}
      const previousVariableDerivativesWrtT = previousDerivativesWrtT?.[variableName] ?? {}
      this[variableName] = this.variableFactory(variableName, rawVariableState, previousRawVariableState, previousVariableDerivativesWrtT)
    })
  }

  static isEqual(sensorData1, sensorData2) {
    return Object.entries(sensorData1).every(([variableName, variableData]) => {
      return Variable.isEqual(variableData, sensorData2?.[variableName])
    })
  }

  static getVariableConstructorByName(variableName) {
    return VariableConstructors[variableName]
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
    return Object.fromEntries(
      Object.entries(this).reduce((derivatives, [_, variable]) => {
        if (variable.hasDerivative) {
          return [...derivatives, [variable.derivativeName, variable.derivativeWrtT]]
        }
        return derivatives
      }, [])
    )
  }

  variableFactory(variableName, rawVariableState, previousRawVariableState, previousVariableDerivativesWrtT) {
    const constructor = SensorData.getVariableConstructorByName(variableName)
    return new constructor(rawVariableState, previousRawVariableState, previousVariableDerivativesWrtT, constructor, this)
  }

  isEqual(sensorData) {
    return SensorData.isEqual(this, sensorData)
  }
}
