import { Variable } from '../../lib/physics'

import { VariableConstructors } from '../../constants'

export default class SensorData {
  #timestamp
  #previousTimestamp
  #deltaT
  #previousDerivativesWrtT

  static deltaT = 1

  constructor(rawSensorData, previousRawSensorData, previousDerivativesWrtT, timestamp, previousTimestamp) {
    this.#timestamp = timestamp
    this.#previousTimestamp = previousTimestamp
    this.#deltaT = SensorData.deltaT
    this.#previousDerivativesWrtT = previousDerivativesWrtT

    const nullOrUndefined = (x) => x === null || x === undefined
    const foo = (variable) => !nullOrUndefined(variable?.x) && !nullOrUndefined(variable?.y) && !nullOrUndefined(variable?.z)

    Object.entries(rawSensorData).forEach(([variableName, rawVariableData]) => {
      const constructor = SensorData.getVariableConstructorByName(variableName)
      this[variableName] = new constructor(
        foo(rawVariableData) ? Variable.preprocess(rawVariableData) : previousRawSensorData?.[variableName] ?? {},
        previousRawSensorData?.[variableName] ?? {},
        previousDerivativesWrtT?.[variableName] ?? {},
        constructor,
        this,
        rawVariableData?.timestamp ?? null
      )
    })
  }

  static get #initial() {
    return {
      position: {
        x: null,
        y: null,
        z: null
      },
      acceleration: {
        x: null,
        y: null,
        z: null
      },
      orientation: {
        x: null,
        y: null,
        z: null
      },
      angularVelocity: {
        x: null,
        y: null,
        z: null
      }
    }
  }

  static get initial() {
    return new SensorData(this.#initial, this.#initial, null, 0, 0)
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

  get #derivativesWrtT() {
    return this.reduceEntriesToObject((derivatives, [_, variable]) => {
      return variable.hasDerivative ? [...derivatives, [variable.derivativeName, variable.derivativeWrtT]] : derivatives
    })
  }

  get derivativesWrtT() {
    return new SensorData(this.#derivativesWrtT, this.#previousDerivativesWrtT, {}, this.#timestamp, this.#previousTimestamp)
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
