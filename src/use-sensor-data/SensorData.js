import Variable from '../lib/Variable'

import { VariableConstructors } from './constants'

import { toRadians } from '../lib/math'

import Vector3 from '../lib/math/Vector3'

export default class SensorData {
  #timestamp
  #previousTimestamp
  #deltaT
  #previousDerivativesWrtT

  static get empty() {
    return new SensorData({}, {}, Variable.empty, null, null)
  }

  static transformVariable(variableState) {
    return variableState
      ? new Vector3(
          ...Object.entries(variableState)
            .toSorted(([componentName1], [componentName2]) => componentName1 > componentName2)
            .map(([_, componentValue]) => componentValue)
        )
      : Vector3.empty
  }

  constructor(rawSensorData, previousRawSensorData, previousDerivativesWrtT, timestamp, previousTimestamp) {
    this.#timestamp = timestamp
    this.#previousTimestamp = previousTimestamp
    this.#deltaT = 1 // Must be consistent with clock settings
    this.#previousDerivativesWrtT = previousDerivativesWrtT

    Object.entries(rawSensorData).forEach(([variableName, rawVariableState]) => {
      const previousRawVariableState = previousRawSensorData?.[variableName] ?? {}
      const previousVariableDerivativesWrtT = previousDerivativesWrtT?.[variableName] ?? {}

      const transformedVariableState = SensorData.transformVariable(rawVariableState)
      const transformedPreviousVariableState = SensorData.transformVariable(previousRawVariableState)

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

  get deltaT() {
    return this.#deltaT
  }

  get derivativesWrtT() {
    const _derivativesWrtT = this.reduceEntriesToObject((derivatives, [_, variable]) => {
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
    return sensorData1.everyEntry(([variableName, variableData]) => {
      return Variable.isEqual(variableData, sensorData2?.[variableName])
    })
  }

  everyEntry(callback) {
    Object.entries(this).every(callback)
  }

  reduceEntriesToObject(reducer) {
    return Object.fromEntries(Object.entries(this).reduce(reducer, []))
  }

  isEqual(sensorData) {
    return SensorData.isEqual(this, sensorData)
  }
}
