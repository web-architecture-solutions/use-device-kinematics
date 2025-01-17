import Variable from '../lib/Variable'

import { VariableConstructors } from './constants'

export default class SensorData {
  #timestamp
  #previousTimestamp
  #previousDerivativesWrtT

  constructor(rawSensorData, previousRawSensorData, previousDerivativesWrtT, timestamp, previousTimestamp) {
    this.#timestamp = timestamp
    this.#previousTimestamp = previousTimestamp
    this.#previousDerivativesWrtT = previousDerivativesWrtT

    Object.entries(rawSensorData).forEach(([variableName, rawVariableState]) => {
      const renameComponent = (componentName) => {
        const renameComponents = SensorData.getRenameComponentsByVariableName(variableName)
        const shouldComponentBeRenamed = renameComponents && componentName in renameComponents
        return shouldComponentBeRenamed ? renameComponents[componentName] : componentName
      }
      const renamedVariableState = Object.fromEntries(
        Object.entries(rawVariableState).map(([componentName, componentValue]) => {
          return [renameComponent(componentName), componentValue]
        })
      )

      const previousRawVariableState = previousRawSensorData?.[variableName] ?? {}
      const previousVariableDerivativesWrtT = previousDerivativesWrtT?.[variableName] ?? {}
      const constructor = SensorData.getVariableConstructorByName(variableName)
      this[variableName] = new constructor(
        renamedVariableState,
        previousRawVariableState,
        previousVariableDerivativesWrtT,
        constructor,
        this
      )
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

  static getRenameComponentsByVariableName(variableName) {
    return VariableConstructors[variableName]?.renameComponents ?? null
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
