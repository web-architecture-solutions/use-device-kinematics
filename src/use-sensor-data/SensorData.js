import Variable from '../lib/Variable'

import { VariableConstructors } from './constants'

import { toRadians } from '../lib/math'

export default class SensorData {
  #timestamp
  #previousTimestamp
  #previousDerivativesWrtT

  static transformVariable(variableName, variableState) {
    function renameComponent(variableName, componentName) {
      const renameComponents = SensorData.getRenameComponentsByVariableName(variableName)
      const shouldComponentBeRenamed = renameComponents && componentName in renameComponents
      return shouldComponentBeRenamed ? renameComponents[componentName] : componentName
    }

    function handleAngularValues(variableName, componentValue) {
      const useRadians = SensorData.getUseRadiansByVariableName(variableName)
      return useRadians ? toRadians(componentValue) : componentValue
    }

    return Object.fromEntries(
      Object.entries(variableState).map(([componentName, componentValue]) => {
        return [renameComponent(variableName, componentName), handleAngularValues(variableName, componentValue)]
      })
    )
  }

  constructor(rawSensorData, previousRawSensorData, previousDerivativesWrtT, timestamp, previousTimestamp) {
    this.#timestamp = timestamp
    this.#previousTimestamp = previousTimestamp
    this.#previousDerivativesWrtT = previousDerivativesWrtT

    Object.entries(rawSensorData).forEach(([variableName, rawVariableState]) => {
      const previousRawVariableState = previousRawSensorData?.[variableName] ?? {}
      const previousVariableDerivativesWrtT = previousDerivativesWrtT?.[variableName] ?? {}

      const transformedVariableState = SensorData.transformVariable(variableName, rawVariableState)
      const transformedPreviousVariableState = SensorData.transformVariable(variableName, previousRawVariableState)

      const constructor = SensorData.getVariableConstructorByName(variableName)

      this[variableName] = new constructor(
        transformedVariableState,
        transformedPreviousVariableState,
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

  static getUseRadiansByVariableName(variableName) {
    return VariableConstructors[variableName]?.useRadians ?? false
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
