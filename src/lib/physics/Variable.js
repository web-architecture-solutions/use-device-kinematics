import { Vector3, big } from '../math'

export default class Variable extends Vector3 {
  #previous
  #timestamp

  #deltaT
  #subclassConstructor
  #derivativeWrtT
  #derivativeConstructor
  #derivativeName

  static get initial() {
    return new Variable({ x: null, y: null, z: null }, null, Variable, null)
  }

  static preprocess = ({ x, y, z } = { x: null, y: null, z: null }) => new Vector3(x, y, z)

  static calculateDerivativeWrtT(variable) {
    const initializeComponentDerivative = (componentValue, index) => {
      const delta = big * componentValue - big * variable.previous[index]
      const deltaT = big * variable.timestamp - big * variable.previous.timestamp
      return delta / deltaT
    }
    return variable.map(initializeComponentDerivative)
  }

  static isEqual(variableData1, variableData2) {
    return variableData1.every((componentValue, index) => {
      return variableData2[index] === componentValue
    })
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

    if (previousVariable && previousVariable.length === 3 && !Variable.isEqual(rawVariableData, previousVariable)) {
      this.#previous = new this.#subclassConstructor(
        previousVariable,
        Variable.initial,
        this.#subclassConstructor,
        previousVariable?.timestamp ?? null
      )

      this.#derivativeWrtT = this.#derivativeConstructor
        ? new this.#derivativeConstructor(
            this.#subclassConstructor.calculateDerivativeWrtT(this, this.#deltaT),
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

  isEqual(variable) {
    return Variable.isEqual(this, variable)
  }
}
