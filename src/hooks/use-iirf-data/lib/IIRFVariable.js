import { Vector3, big } from '../../../lib/math'

function formatNumber(number, length) {
  if (!number) return number
  return number > 0 ? `+${number.toFixed(length)}` : number === 0 ? `0${number.toFixed(length)}` : number.toFixed(length)
}

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
      IIRFVariable.componentIsNullOrUndefined(preprocessedVariableData?.x) ||
      IIRFVariable.componentIsNullOrUndefined(preprocessedVariableData?.y) ||
      IIRFVariable.componentIsNullOrUndefined(preprocessedVariableData?.z)
    )
  }

  static prepare = ({ x, y, z } = { x: null, y: null, z: null }) => new Vector3(x, y, z)

  constructor(rawVariableData, previousVariable, schema, timestamp) {
    super()

    this[0] = rawVariableData?.[0] ?? null
    this[1] = rawVariableData?.[1] ?? null
    this[2] = rawVariableData?.[2] ?? null

    this.#schema = schema
    this.#name = this.#schema.name
    this.#derivativeSchema = this.#schema?.derivativeSchema ?? null
    this.#derivativeName = this.#derivativeSchema?.name ?? null
    this.#timestamp = timestamp

    this.#previous = previousVariable ? new IIRFVariable(previousVariable, null, this.#schema, previousVariable.timestamp) : null
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
      const deltaT = (big * this.timestamp - big * this.previous.timestamp) / 1000
      const calculateComponentDerivativeWrtT = (componentValue, index) => {
        const delta = big * componentValue - big * this.previous[index]
        return delta / deltaT
      }
      return new IIRFVariable(
        this.map(calculateComponentDerivativeWrtT),
        this.previous?.derivativeWrtT ?? null,
        this.schema,
        this.timestamp
      )
    }
    return null
  }

  static areComponentsEqual(variable1, variable2) {
    if (!variable1 && !variable2) return true
    if (!variable1 || !variable2) return false
    if (!variable1.x && !variable1.y && !variable1.z && !variable2.x && !variable2.y && !variable2.z) return true
    if (!variable1.x || !variable1.y || !variable1.z || !variable2.x || !variable2.y || !variable2.z) return false
    return variable1.x === variable2.x && variable1.y === variable2.y && variable1.z === variable2.z
  }

  static areTimestampsEqual(variable1, variable2) {
    if (!variable1 && !variable2) return true
    if (!variable1 || !variable2) return false
    if (!variable1?.timestamp && !variable2?.timestamp) return true
    if (!variable1?.timestamp || !variable2?.timestamp) return false
    return variable1.timestamp === variable2.timestamp
  }

  static isEqual(variable1, variable2) {
    return IIRFVariable.areComponentsEqual(variable1, variable2) && IIRFVariable.areTimestampsEqual(variable1, variable2)
  }

  areComponentsEqual(variable) {
    return IIRFVariable.areComponentsEqual(this, variable)
  }

  areTimestampsEqual(variable) {
    return IIRFVariable.areTimestampsEqual(this, variable)
  }

  isEqual(variable) {
    return IIRFVariable.isEqual(this, variable)
  }

  get areComponentsEqualToPrevious() {
    return this.areComponentsEqual(this.previous)
  }

  get isTimestampEqualToPrevious() {
    return this.areTimestampsEqual(this.previous)
  }

  get isEqualToPrevious() {
    return this.isEqual(this.previous)
  }

  get json() {
    return {
      name: this.name,
      x: formatNumber(this.x, 10),
      y: formatNumber(this.y, 10),
      z: formatNumber(this.z, 10),
      timestamp: formatNumber(this.timestamp, 10),
      previousX: formatNumber(this.previous?.x, 10),
      previousY: formatNumber(this.previous?.y, 10),
      previousZ: formatNumber(this.previous?.z, 10),
      previousTimestamp: formatNumber(this.previous?.timestamp, 10),
      derivativeWrtT: this.derivativeWrtT?.map((component) => formatNumber(component, 10)),
      areComponentsEqualToPrevious: this.areComponentsEqualToPrevious,
      isTimestampEqualToPrevious: this.isTimestampEqualToPrevious,
      isEqualToPrevious: this.isEqualToPrevious
    }
  }
}
