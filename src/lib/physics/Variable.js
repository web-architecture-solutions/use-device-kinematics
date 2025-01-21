import { Vector3 } from '../math'

export default class Variable extends Vector3 {
  #previous
  #timestamp
  #previousTimestamp
  #deltaT
  #previousDerivativesWrtT
  #subclassConstructor
  #derivativeWrtT
  #derivativeConstructor
  #derivativeName
  #sensorData

  static preprocess = ({ x, y, z } = { x: null, y: null, z: null }) => new Vector3(x, y, z)

  static calculateDerivativeWrtT(variable) {
    const initializeComponentDerivative = (componentValue, index) => {
      const delta = componentValue - variable.previous[index]
      const deltaT = variable.timestamp - variable.previous.timestamp
      return delta / deltaT
    }
    return variable.map(initializeComponentDerivative)
  }

  static isEqual(variableData1, variableData2) {
    return variableData1.every((componentValue, index) => {
      return variableData2[index] === componentValue
    })
  }

  constructor(rawVariableState, previousRawVariableState, previousDerivativesWrtT, subclassConstructor, sensorData, timestamp) {
    super()

    this.#previous = previousRawVariableState
    this.#previousDerivativesWrtT = previousDerivativesWrtT
    this.#subclassConstructor = subclassConstructor
    this.#derivativeConstructor = subclassConstructor?.derivative ?? null
    this.#derivativeName = this.#derivativeConstructor?.name ?? null
    this.#sensorData = sensorData
    this.#timestamp = timestamp ?? null
    this.#previousTimestamp = this.#sensorData?.previousTimestamp ?? null
    this.#deltaT = this.#timestamp - this.#previousTimestamp

    this[0] = rawVariableState[0] ?? null
    this[1] = rawVariableState[1] ?? null
    this[2] = rawVariableState[2] ?? null

    if (
      previousRawVariableState &&
      previousRawVariableState.length === 3 &&
      !Variable.isEqual(rawVariableState, previousRawVariableState)
    ) {
      this.#previous = new this.#subclassConstructor(
        previousRawVariableState,
        Vector3.empty,
        this.#previousDerivativesWrtT,
        this.#subclassConstructor,
        this.#sensorData,
        previousRawVariableState?.timestamp ?? null
      )

      this.#derivativeWrtT = this.#derivativeConstructor
        ? new this.#derivativeConstructor(
            this.#subclassConstructor.calculateDerivativeWrtT(this, this.#deltaT),
            this.#previousDerivativesWrtT,
            Vector3.empty,
            this.#derivativeConstructor,
            this.#sensorData,
            this.timestamp
          )
        : null
    }
  }

  get previous() {
    return this.#previous
  }

  get hasDerivative() {
    return this.#derivativeConstructor ? true : false
  }

  get derivativeName() {
    return this.#derivativeName
  }

  get derivativeWrtT() {
    return this.#derivativeWrtT
  }

  get timestamp() {
    return this.#timestamp
  }

  isEqual(variable) {
    return Variable.isEqual(this, variable)
  }
}
