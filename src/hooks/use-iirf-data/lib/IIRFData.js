import IIRFVariable from './IIRFVariable'

import variableSchemata from './variableSchemata'

const nullOrUndefined = (x) => x === null || x === undefined
const isVariableNullOrUndefined = (variable) => nullOrUndefined(variable?.x) || nullOrUndefined(variable?.y) || nullOrUndefined(variable?.z)

export default class IIRFData {
  static initialData = {
    position: IIRFVariable.initialData,
    acceleration: IIRFVariable.initialData,
    orientation: IIRFVariable.initialData,
    angularVelocity: IIRFVariable.initialData
  }

  static get initial() {
    return new IIRFData(this.initialData, null)
  }

  static isEqual(sensorData1, sensorData2) {
    return Object.entries(sensorData1).every(([variableName, variableData]) => {
      return IIRFVariable.isEqual(variableData, sensorData2[variableName])
    })
  }

  constructor(rawSensorData, previousSensorData) {
    Object.entries(rawSensorData).forEach(([variableName, rawVariableData]) => {
      const previousVariableData = previousSensorData?.[variableName] ?? IIRFVariable.initial
      this[variableName] = new IIRFVariable(
        isVariableNullOrUndefined ? IIRFVariable.preprocess(rawVariableData) : previousVariableData,
        previousVariableData,
        variableSchemata[variableName] ?? null,
        rawVariableData.timestamp
      )
    })
  }

  get isReady() {
    return !this.isEqual(IIRFData.initial)
  }

  get #derivativesWrtT() {
    return this.reduceEntriesToObject((derivatives, [_, variable]) => {
      return variable.hasDerivative ? [...derivatives, [variable.derivativeName, variable.derivativeWrtT]] : derivatives
    })
  }

  get derivativesWrtT() {
    return new IIRFData(this.#derivativesWrtT, IIRFData.initial)
  }

  // BUG
  everyEntry(callback) {
    Object.entries(this).every(callback)
  }

  reduceEntriesToObject(reducer) {
    return Object.fromEntries(Object.entries(this).reduce(reducer, []))
  }

  isEqual(iirfData) {
    return IIRFData.isEqual(this, iirfData)
  }
}
