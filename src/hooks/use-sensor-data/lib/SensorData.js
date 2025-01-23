import { Variable } from '../../../lib/physics'

import { variableSchemata } from '../../../lib/physics'

export default class SensorData {
  static initialData = {
    position: Variable.initialData,
    acceleration: Variable.initialData,
    orientation: Variable.initialData,
    angularVelocity: Variable.initialData
  }

  static get initial() {
    return new SensorData(this.initialData, null)
  }

  static isEqual(sensorData1, sensorData2) {
    return Object.entries(sensorData1).every(([variableName, variableData]) => {
      return Variable.isEqual(variableData, sensorData2[variableName])
    })
  }

  constructor(rawSensorData, previousSensorData) {
    //const nullOrUndefined = (x) => x === null || x === undefined
    //const isVariableNull = (variable) => !nullOrUndefined(variable?.x) && !nullOrUndefined(variable?.y) && !nullOrUndefined(variable?.z)

    Object.entries(rawSensorData).forEach(([variableName, rawVariableData]) => {
      this[variableName] = new Variable(
        Variable.preprocess(rawVariableData),
        previousSensorData?.[variableName] ?? Variable.initial,
        variableSchemata[variableName] ?? null,
        rawVariableData.timestamp
      )
    })
  }

  get isReady() {
    return !this.isEqual(SensorData.initial)
  }

  get #derivativesWrtT() {
    return this.reduceEntriesToObject((derivatives, [_, variable]) => {
      return variable.hasDerivative ? [...derivatives, [variable.derivativeName, variable.derivativeWrtT]] : derivatives
    })
  }

  get derivativesWrtT() {
    return new SensorData(this.#derivativesWrtT, SensorData.initial)
  }

  // BUG
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
