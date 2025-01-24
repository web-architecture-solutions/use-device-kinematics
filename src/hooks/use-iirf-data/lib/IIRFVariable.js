import { Vector3, big } from '../../../lib/math'

export default class IIRFVariable extends Vector3 {
  #previous
  #timestamp
  #schema
  #name
  #derivativeSchema
  #derivativeName

  static initialData = { x: null, y: null, z: null }

  static get initial() {
    return new IIRFVariable(this.initialData, null, IIRFVariable, null)
  }

  static componentIsNullOrUndefined = (x) => x === null || x === undefined

  static isNullOrUndefined(preprocessedVariableData) {
    return (
      IIRFVariable.componentIsNullOrUndefined(preprocessedVariableData.x) ||
      IIRFVariable.componentIsNullOrUndefined(preprocessedVariableData.y) ||
      IIRFVariable.componentIsNullOrUndefined(preprocessedVariableData.z)
    )
  }

  static prepare = ({ x, y, z } = { x: null, y: null, z: null }) => new Vector3(x, y, z)

  static isEqual(variable1, variable2) {
    return variable1.every((component, index) => component === variable2[index])
  }

  constructor(rawVariableData, previousVariable, schema, timestamp) {
    super()

    this[0] = rawVariableData[0]
    this[1] = rawVariableData[1]
    this[2] = rawVariableData[2]

    this.#previous = previousVariable
    this.#schema = schema
    this.#name = this.#schema.name
    this.#derivativeSchema = this.#schema?.derivativeSchema ?? null
    this.#derivativeName = this.#derivativeSchema?.name ?? null
    this.#timestamp = timestamp ?? null
  }

  get name() {
    return this.#name
  }

  get x() {
    return this[0]
  }

  get y() {
    return this[1]
  }

  get z() {
    return this[2]
  }

  get timestamp() {
    return this.#timestamp
  }

  get previous() {
    return this.#previous
  }

  get hasDerivative() {
    return this.#derivativeSchema ? true : false
  }

  get derivativeName() {
    return this.#derivativeName
  }

  get derivativeWrtT() {
    if (this.#schema?.calculateDerivativeWrtT) {
      return this.#schema.calculateDerivativeWrtT(this)
    }
    if (this.previous) {
      const deltaT = big * this.timestamp - big * this.previous.timestamp
      const calculateComponentDerivativeWrtT = (componentValue, index) => {
        const delta = big * componentValue - big * this.previous[index]
        return delta / deltaT
      }
      return new IIRFVariable(
        this.map(calculateComponentDerivativeWrtT),
        this.#previous.derivativeWrtT ?? IIRFVariable.initial,
        this.#schema,
        this.#timestamp
      )
    }
    return null
  }

  isEqual(variable) {
    return IIRFVariable.isEqual(this, variable)
  }
}
