import IIRFVariable from './IIRFVariable'

import variableSchemata from '../../../lib/variableSchemata'

export default class IIRFData {
  #previous

  static initialData = {
    position: IIRFVariable.initialData,
    acceleration: IIRFVariable.initialData,
    orientation: IIRFVariable.initialData,
    angularVelocity: IIRFVariable.initialData
  }

  static get initial() {
    return new IIRFData(this.initialData, null)
  }

  static isEqual(iirfData1, iirfData2) {
    return Object.entries(iirfData1).every(([variableName, variableData]) => {
      return IIRFVariable.isEqual(variableData, iirfData2[variableName])
    })
  }

  static variableToDerivativeEntries(derivatives, [_, variable]) {
    return variable.hasDerivative ? [...derivatives, [variable.derivativeName, variable.derivativeWrtT]] : derivatives
  }

  constructor(preprocessedSensorData, previousIIRFData) {
    this.#previous = previousIIRFData

    Object.entries(preprocessedSensorData).forEach(([variableName, preprocessedVariableData]) => {
      const previousVariableData = previousIIRFData?.[variableName] ?? IIRFVariable.initial

      this[variableName] = new IIRFVariable(
        !IIRFVariable.isNullOrUndefined(preprocessedVariableData) ? IIRFVariable.prepare(preprocessedVariableData) : previousVariableData,
        previousVariableData,
        variableSchemata[variableName],
        preprocessedVariableData.timestamp
      )
    })
  }

  get isReady() {
    return !this.isEqual(IIRFData.initial)
  }

  get #derivativesWrtT() {
    return Object.fromEntries(Object.entries(this).reduce(IIRFData.variableToDerivativeEntries, []))
  }

  get derivativesWrtT() {
    return new IIRFData(this.#derivativesWrtT, this.#previous.derivativesWrtT)
  }

  isEqual(iirfData) {
    return IIRFData.isEqual(this, iirfData)
  }
}
