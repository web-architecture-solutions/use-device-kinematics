import { Vector3, big } from '../../../lib/math'

import { formatNumber, isNullOrUndefined } from './util'

export default class IIRFVariable extends Vector3 {
  #previous
  #deltaT
  #schema
  #name
  #derivativeSchema
  #derivativeName

  static initialData = { x: null, y: null, z: null }

  static get initial() {
    return new IIRFVariable(this.initialData, null, IIRFVariable, null)
  }

  static isNullOrUndefined(preprocessedVariableData) {
    return (
      isNullOrUndefined(preprocessedVariableData?.x) ||
      isNullOrUndefined(preprocessedVariableData?.y) ||
      isNullOrUndefined(preprocessedVariableData?.z)
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

    this.#previous = previousVariable ? new IIRFVariable(previousVariable, null, this.#schema, deltaT) : null
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
    return this.#derivativeSchema ? true : false
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
        const delta = big * componentValue - big * this.previous[index]
        return delta / (big * (this.deltaT / 1000))
      }
      return new IIRFVariable(this.map(calculateComponentDerivativeWrtT), this.previous?.derivativeWrtT ?? null, this.schema, this.deltaT)
    }
    return null
  }

  get json() {
    return {
      name: this.name,
      x: this.x,
      y: this.y,
      z: this.z,
      deltaT: this.deltaT,
      previousX: this.previous?.x,
      previousY: this.previous?.y,
      previousZ: this.previous?.z,
      previousDeltaT: this.previous?.deltaT,
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
