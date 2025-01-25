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

  static variableToDerivativeEntries(derivatives, [_, variable]) {
    return variable.hasDerivative ? [...derivatives, [variable.derivativeName, variable.derivativeWrtT]] : derivatives
  }

  constructor(preprocessedSensorData, previousIIRFData) {
    this.#previous = previousIIRFData

    Object.entries(preprocessedSensorData).forEach(([variableName, preprocessedVariableData]) => {
      const previousVariableData = previousIIRFData?.[variableName] ?? null

      this[variableName] = new IIRFVariable(
        !IIRFVariable.isNullOrUndefined(preprocessedVariableData) ? IIRFVariable.prepare(preprocessedVariableData) : previousVariableData,
        previousVariableData,
        variableSchemata[variableName],
        preprocessedVariableData?.timestamp ?? null
      )
    })
  }

  get #derivativesWrtT() {
    return Object.fromEntries(Object.entries(this).reduce(IIRFData.variableToDerivativeEntries, []))
  }

  get derivativesWrtT() {
    return new IIRFData(this.#derivativesWrtT, this.#previous?.derivativesWrtT)
  }

  get toString() {
    return JSON.stringify(
      Object.fromEntries(
        Object.entries(this).map(([variableName, variable]) => {
          return [variableName, variable.json]
        })
      ),
      null,
      2
    )
  }
}
