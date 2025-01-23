import { Vector3, big } from '../math'

export default class Variable extends Vector3 {
  #previous
  #timestamp
  #subclassConstructor
  #derivativeWrtT
  #derivativeConstructor
  #derivativeName

  static initialData = { x: null, y: null, z: null }

  static preprocess = ({ x, y, z } = { x: null, y: null, z: null }) => new Vector3(x, y, z)

  static calculateDerivativeWrtT(variable) {
    const deltaT = big * variable.timestamp - big * variable.previous.timestamp
    const calculateComponentDerivativeWrtT = (componentValue, index) => {
      const delta = big * componentValue - big * variable.previous[index]
      return delta / deltaT
    }
    return variable.map(calculateComponentDerivativeWrtT)
  }

  constructor(rawVariableData, previousVariable, subclassConstructor, timestamp) {
    super()

    this.#previous = previousVariable
    this.#subclassConstructor = subclassConstructor
    this.#derivativeConstructor = subclassConstructor?.derivative ?? null
    this.#derivativeName = this.#derivativeConstructor?.name ?? null
    this.#timestamp = timestamp ?? null

    this[0] = rawVariableData[0] ?? null
    this[1] = rawVariableData[1] ?? null
    this[2] = rawVariableData[2] ?? null

    if (previousVariable) {
      this.#previous = new this.#subclassConstructor(
        previousVariable,
        Variable.initial,
        this.#subclassConstructor,
        previousVariable?.timestamp ?? null
      )

      this.#derivativeWrtT = this.#derivativeConstructor
        ? new this.#derivativeConstructor(
            this.#subclassConstructor.calculateDerivativeWrtT(this),
            this.#previous.derivativesWrtT,
            Variable.initial,
            this.#derivativeConstructor,
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

  static isEqual(variable1, variable2) {
    return variable1.every((component, index) => component === variable2[index])
  }

  isEqual(variable) {
    return Variable.isEqual(this, variable)
  }
}
