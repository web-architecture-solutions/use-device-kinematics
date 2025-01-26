import { Vector3, S } from '../../../lib/math'

export default class IIRFVariable extends Vector3 {
  #previous
  #deltaT
  #schema
  #name
  #derivativeSchema
  #derivativeName

  static initialData = { x: null, y: null, z: null }

  static get initial() {
    return new IIRFVariable(this.initialData, null, {}, null)
  }

  static componentIsNullOrUndefined = (x) => x === null || x === undefined

  static isNullOrUndefined(normalizedVariableData) {
    return (
      IIRFVariable.componentIsNullOrUndefined(normalizedVariableData?.x) ||
      IIRFVariable.componentIsNullOrUndefined(normalizedVariableData?.y) ||
      IIRFVariable.componentIsNullOrUndefined(normalizedVariableData?.z)
    )
  }

  static prepare = ({ x, y, z } = { x: null, y: null, z: null }) => new Vector3(x, y, z)

  constructor(rawVariableData, previousVariable, schema, deltaT) {
    super()

    this[0] = rawVariableData?.[0] ?? null
    this[1] = rawVariableData?.[1] ?? null
    this[2] = rawVariableData?.[2] ?? null

    this.#schema = schema
    this.#name = this.#schema.name
    this.#derivativeSchema = this.#schema?.derivativeSchema ?? null
    this.#derivativeName = this.#derivativeSchema?.name ?? null
    this.#deltaT = deltaT

    this.#previous = previousVariable
      ? new IIRFVariable(
          new Vector3(...previousVariable),
          previousVariable.previous ? new Vector3(...previousVariable.previous) : null,
          this.schema,
          previousVariable.deltaT
        )
      : null
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

  get deltaT() {
    return this.#deltaT
  }

  get previous() {
    return this.#previous
  }

  get schema() {
    return this.#schema
  }

  get hasDerivative() {
    return Boolean(this.#derivativeSchema)
  }

  get derivativeName() {
    return this.#derivativeName
  }

  get derivativeWrtT() {
    if (this.schema?.calculateDerivativeWrtT) {
      return this.schema.calculateDerivativeWrtT(this)
    }
    if (this.previous) {
      const calculateComponentDerivativeWrtT = (componentValue, index) => {
        const delta = S * componentValue - S * this.previous[index]
        return delta / (S * this.deltaT)
      }
      return new IIRFVariable(this.map(calculateComponentDerivativeWrtT), this.previous.derivativeWrtT, this.schema, this.deltaT)
    }
    return IIRFVariable.initial
  }

  get json() {
    return {
      name: this.name,
      x: this.x,
      y: this.y,
      z: this.z,
      deltaT: this.deltaT,
      previousX: this.previous?.x ?? null,
      previousY: this.previous?.y ?? null,
      previousZ: this.previous?.z ?? null,
      previousDeltaT: this.previous?.deltaT ?? null,
      derivativeWrtT: this.derivativeWrtT,
      isEqualToPrevious: this.isEqual(this.previous)
    }
  }

  get toString() {
    return JSON.stringify(this.json, null, 2)
  }

  static isEqual(variable1, variable2) {
    if (!variable1 && !variable2) return true
    if (!variable1 || !variable2) return false
    if (!variable1.x && !variable1.y && !variable1.z && !variable2.x && !variable2.y && !variable2.z) return true
    if (!variable1.x || !variable1.y || !variable1.z || !variable2.x || !variable2.y || !variable2.z) return false
    return variable1.x === variable2.x && variable1.y === variable2.y && variable1.z === variable2.z
  }

  isEqual(variable) {
    return IIRFVariable.isEqual(this, variable)
  }
}
