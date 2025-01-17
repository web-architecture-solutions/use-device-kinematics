export default class Variable extends Array {
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

  #initialize(currentState, previousState) {
    this[0] = currentState?.[0]
    this[1] = currentState?.[1]
    this[2] = currentState?.[2]

    if (previousState && previousState.length === 3 && !Variable.isEqual(currentState, previousState)) {
      this.#previous = new this.#subclassConstructor(
        previousState,
        [null, null, null],
        this.#previousDerivativesWrtT,
        this.#subclassConstructor,
        this.#sensorData
      )
      const derivativeWrtT = this.constructor.calculateDerivativeWrtT(this, this.#deltaT)
      this.#derivativeWrtT = this.#derivativeConstructor
        ? new this.#derivativeConstructor(
            derivativeWrtT,
            this.#previousDerivativesWrtT,
            [null, null, null],
            this.#derivativeConstructor,
            this.#sensorData
          )
        : [null, null, null]
    }
  }

  constructor(rawVariableState, previousRawVariableState, previousDerivativesWrtT, subclassConstructor, sensorData) {
    super()

    this.#previous = [null, null, null]
    this.#previousDerivativesWrtT = previousDerivativesWrtT
    this.#subclassConstructor = subclassConstructor
    this.#derivativeConstructor = subclassConstructor?.derivative ?? null
    this.#derivativeName = this.#derivativeConstructor?.name ?? null
    this.#sensorData = sensorData
    this.#timestamp = this.#sensorData?.timestamp ?? null
    this.#previousTimestamp = this.#sensorData?.previousTimestamp ?? null
    this.#deltaT = this.#timestamp - this.#previousTimestamp
    this.#initialize(rawVariableState, previousRawVariableState)
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
