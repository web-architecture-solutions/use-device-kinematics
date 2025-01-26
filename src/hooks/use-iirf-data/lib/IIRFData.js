import IIRFVariable from './IIRFVariable'

import { variableSchemata } from '../../../lib'

export default class IIRFData {
  #previous
  #deltaT
  #refreshRates

  static initialData = {
    position: IIRFVariable.initialData,
    acceleration: IIRFVariable.initialData,
    orientation: IIRFVariable.initialData,
    angularVelocity: IIRFVariable.initialData
  }

  static get initial() {
    return new IIRFData(this.initialData, null, null)
  }

  static variableToDerivativeEntries(derivatives, [_, variable]) {
    return variable.hasDerivative ? [...derivatives, [variable.derivativeName, variable.derivativeWrtT]] : derivatives
  }

  constructor(normalizedSensorData, previousIIRFData, deltaT, refreshRates) {
    this.#previous = previousIIRFData
    this.#deltaT = deltaT
    this.#refreshRates = refreshRates

    Object.entries(normalizedSensorData).forEach(([variableName, normalizedVariableData]) => {
      const previousVariable = previousIIRFData?.[variableName] ?? IIRFVariable.initial

      this[variableName] = new IIRFVariable(
        !IIRFVariable.isNullOrUndefined(normalizedVariableData) ? IIRFVariable.prepare(normalizedVariableData) : previousVariable,
        previousVariable,
        variableSchemata[variableName],
        this.#deltaT
      )
    })
  }

  get deltaT() {
    return this.#deltaT
  }

  get refreshRates() {
    return this.#refreshRates
  }

  get #derivativesWrtT() {
    return Object.fromEntries(Object.entries(this).reduce(IIRFData.variableToDerivativeEntries, []))
  }

  get derivativesWrtT() {
    return new IIRFData(this.#derivativesWrtT, this.#previous?.derivativesWrtT)
  }

  get json() {
    return Object.fromEntries(
      Object.entries(this).map(([variableName, variable]) => {
        return [variableName, variable.json]
      })
    )
  }

  get toString() {
    return JSON.stringify(this.json, null, 2)
  }
}
