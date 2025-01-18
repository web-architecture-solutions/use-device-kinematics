import Vector3 from './math/Vector3'

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

  static calculateDerivativeWrtT(variable, deltaT) {
    const initializeComponentDerivative = (componentValue, index) => {
      const delta = componentValue - variable.previous[index]
      return delta / deltaT
    }
    return variable.map(initializeComponentDerivative)
  }

  static isEqual(variableData1, variableData2) {
    return variableData1.every?.((componentValue, index) => {
      return variableData2?.[index] === componentValue
    })
  }

  constructor(rawVariableState, previousRawVariableState, previousDerivativesWrtT, subclassConstructor, sensorData) {
    super()

    this.#previous = previousRawVariableState
    this.#previousDerivativesWrtT = previousDerivativesWrtT
    this.#subclassConstructor = subclassConstructor
    this.#derivativeConstructor = subclassConstructor?.derivative ?? null
    this.#derivativeName = this.#derivativeConstructor?.name ?? null
    this.#sensorData = sensorData
    this.#timestamp = this.#sensorData?.timestamp ?? null
    this.#previousTimestamp = this.#sensorData?.previousTimestamp ?? null
    this.#deltaT = this.#timestamp - this.#previousTimestamp

    this[0] = rawVariableState?.[0] ?? null
    this[1] = rawVariableState?.[1] ?? null
    this[2] = rawVariableState?.[2] ?? null

    if (
      previousRawVariableState &&
      previousRawVariableState.length === 3 &&
      !Variable.isEqual(rawVariableState, previousRawVariableState)
    ) {
      this.#previous = new this.#subclassConstructor(
        previousRawVariableState,
        [null, null, null],
        this.#previousDerivativesWrtT,
        this.#subclassConstructor,
        this.#sensorData
      )

      this.#derivativeWrtT = this.#derivativeConstructor
        ? new this.#derivativeConstructor(
            this.constructor.calculateDerivativeWrtT(this, this.#deltaT),
            this.#previousDerivativesWrtT,
            [null, null, null],
            this.#derivativeConstructor,
            this.#sensorData
          )
        : [null, null, null]
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

  isEqual(variable) {
    return Variable.isEqual(this, variable)
  }
}
