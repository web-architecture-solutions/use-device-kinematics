import { toRadians } from './math'

export default class Variable {
  #useRadians
  #renameComponents
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

  #conditionallyTransformAngularValue(value) {
    return this.#useRadians ? toRadians(value) : value
  }

  #initizalize(state, initializer) {
    return Object.entries(state).map(([name, value]) => {
      const shouldComponentBeRenamed = this.#renameComponents && name in this.#renameComponents
      const componentName = shouldComponentBeRenamed ? this.#renameComponents[name] : name
      return initializer(componentName, value)
    })
  }

  #initizalizeCurrent(currentState) {
    const initializer = (componentName, value) => (this[componentName] = this.#conditionallyTransformAngularValue(value))
    this.#initizalize(currentState, initializer)
  }

  #initializePrevious(previousState) {
    const initializer = (componentName, value) => [componentName, this.#conditionallyTransformAngularValue(value)]
    const initializedPreviousState = Object.fromEntries(this.#initizalize(previousState, initializer))
    this.#previous = new this.#subclassConstructor(initializedPreviousState, null, this.#subclassConstructor, this.#sensorData)
  }

  // NOTE: Must be an arrow function to maintain reference
  #initializeComponentDerivative = ([name, value]) => {
    const delta = value - this.#previous[name]
    return [name, delta / this.#deltaT]
  }

  #initializeDerivatives() {
    const derivativeWrtT = this.map(this.#initializeComponentDerivative)
    this.#derivativeWrtT = this.#subclassConstructor.derivative
      ? new this.#subclassConstructor.derivative(
          derivativeWrtT,
          this.#previousDerivativesWrtT,
          {},
          this.#derivativeConstructor,
          this.#sensorData
        )
      : {}
  }

  constructor(rawVariableState, previousRawVariableState, previousDerivativesWrtT, subclassConstructor, sensorData) {
    this.#previous = null
    this.#previousDerivativesWrtT = previousDerivativesWrtT
    this.#subclassConstructor = subclassConstructor
    this.#useRadians = subclassConstructor?.useRadians ?? null
    this.#renameComponents = subclassConstructor?.renameComponents ?? null
    this.#derivativeConstructor = subclassConstructor?.derivative ?? null
    this.#derivativeName = this.#derivativeConstructor?.name ?? null
    this.#sensorData = sensorData
    this.#timestamp = this.#sensorData?.timestamp ?? null
    this.#previousTimestamp = this.#sensorData?.previousTimestamp ?? null
    this.#deltaT = this.#timestamp - this.#previousTimestamp

    const initialVariableState = subclassConstructor?.initial ?? {}
    const currentState = { ...initialVariableState, ...rawVariableState }
    const previousState = { ...initialVariableState, ...previousRawVariableState }

    this.#initizalizeCurrent(currentState)
    if (Object.keys(previousState).length > 0) {
      this.#initializePrevious(previousState)
      this.#initializeDerivatives()
    }
  }

  get previous() {
    return this.#previous
  }

  get deltaT() {
    return this.#deltaT
  }

  get derivativeConstructor() {
    return this.#derivativeConstructor
  }

  get sensorData() {
    return this.#sensorData
  }

  get previousDerivativesWrtT() {
    return this.#previousDerivativesWrtT
  }

  set derivativeWrtT(_derivativeWrtT) {
    this.#derivativeWrtT = _derivativeWrtT
  }

  get subclassConstructor() {
    return this.#subclassConstructor
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

  get stateVector() {
    return Object.values(this).sort()
  }

  static isEqual(variableData1, variableData2) {
    return variableData1.every(([componentName, componentValue]) => {
      return variableData2?.[componentName] === componentValue
    })
  }

  every(callback) {
    return Object.entries(this).every(callback)
  }

  map(mapper) {
    return Object.fromEntries(Object.entries(this).map(mapper))
  }

  isEqual(variable) {
    return Variable.isEqual(this, variable)
  }
}
