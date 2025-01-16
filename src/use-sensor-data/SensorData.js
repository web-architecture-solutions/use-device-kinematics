import Variable from '../lib/variables/Variable'

import { VariableNames, VariableConstructors } from './constants'

export default class SensorData {
  #timestamp
  #previousTimestamp

  constructor(rawSensorData, previousRawSensorData, previousDerivativesWrtT, timestamp, previousTimestamp) {
    this.#timestamp = timestamp
    this.#previousTimestamp = previousTimestamp

    Object.values(VariableNames).forEach((variableName) => {
      this[variableName] = this.variableFactory(
        variableName,
        rawSensorData,
        previousRawSensorData,
        Object.entries(previousDerivativesWrtT?.[variableName] ?? {})?.[1], // TODO: UGLY!
        timestamp,
        previousTimestamp
      )
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
      Object.entries(this).reduce((derivatives, [name, variable]) => {
        if (variable.hasDerivative) {
          return [...derivatives, [name, { [variable.derivativeName]: variable.derivativesWrtT }]]
        }
        return derivatives
      }, [])
    )
  }

  variableFactory(variableName, rawSensorData, previousRawSensorData, previousDerivativesWrtT) {
    const rawVariableState = rawSensorData?.[variableName] ?? {}
    const previousRawVariableState = previousRawSensorData?.[variableName] ?? {}
    const constructor = SensorData.getVariableConstructorByName(variableName)
    return new constructor(rawVariableState, previousRawVariableState, previousDerivativesWrtT, constructor, this)
  }

  isEqual(sensorData) {
    return SensorData.isEqual(this, sensorData)
  }
}
