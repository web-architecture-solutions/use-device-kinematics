import { Variable } from '../../../lib/physics'

import { VariableConstructors } from '../../../lib/constants'

export default class SensorData {
  constructor(rawSensorData, previousSensorData) {
    const nullOrUndefined = (x) => x === null || x === undefined
    const foo = (variable) => !nullOrUndefined(variable?.x) && !nullOrUndefined(variable?.y) && !nullOrUndefined(variable?.z)

    Object.entries(rawSensorData).forEach(([variableName, rawVariableData]) => {
      const constructor = SensorData.getVariableConstructorByName(variableName)
      this[variableName] = new constructor(
        foo(rawVariableData) ? Variable.preprocess(rawVariableData) : previousSensorData?.[variableName] ?? {},
        previousSensorData?.[variableName] ?? {},
        constructor,
        rawVariableData?.timestamp ?? null
      )
    })
  }

  static get #initial() {
    return {
      position: Variable.initial,
      acceleration: Variable.initial,
      orientation: Variable.initial,
      angularVelocity: Variable.initial
    }
  }

  static get initial() {
    return new SensorData(this.#initial, this.#initial, null, 0, 0)
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

  static getVariableConstructorByName(variableName) {
    return VariableConstructors[variableName]
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
