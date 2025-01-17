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

  static calculateDerivativeWrtT(variable, deltaT) {
    const initializeComponentDerivative = ([name, value]) => {
      const delta = value - variable.previous[name]
      return [name, delta / deltaT]
    }
    return variable.mapEntries(initializeComponentDerivative)
  }

  static isEqual(variableData1, variableData2) {
    return variableData1.every(([componentName, componentValue]) => {
      return variableData2?.[componentName] === componentValue
    })
  }

  #initialize(currentState, previousState) {
    const previousFactory = (variableState) => {
      const previousStateInitializer = (componentName, value) => [componentName, handleAngularValues(value)]
      const initializedPreviousSensorData = Object.fromEntries(initizalizeWith(variableState, previousStateInitializer))
      return new this.#subclassConstructor(initializedPreviousSensorData, null, this.#subclassConstructor, this.#sensorData)
    }

    const derivativeFactory = (variable, deltaT, derivativeConstructor, previousDerivativesWrtT, sensorData) => {
      const derivativeWrtT = variable.constructor.calculateDerivativeWrtT(variable, deltaT)
      return derivativeConstructor
        ? new derivativeConstructor(derivativeWrtT, previousDerivativesWrtT, {}, derivativeConstructor, sensorData)
        : {}
    }

    const handleAngularValues = (value) => (this.#useRadians ? toRadians(value) : value)

    const renameComponent = (name) => {
      const shouldComponentBeRenamed = this.#renameComponents && name in this.#renameComponents
      return shouldComponentBeRenamed ? this.#renameComponents[name] : name
    }

    const initizalizeWith = (variableState, initializer) => {
      return Object.entries(variableState).map(([name, value]) => initializer(renameComponent(name), value))
    }

    const initizalizeCurrent = (variableState) => {
      const currentStateInitializer = (componentName, value) => (this[componentName] = handleAngularValues(value))
      initizalizeWith(variableState, currentStateInitializer)
    }

    const initializePrevious = (variableState) => (this.#previous = previousFactory(variableState))

    const initializeDerivative = () => {
      this.#derivativeWrtT = derivativeFactory(
        this,
        this.#deltaT,
        this.#subclassConstructor.derivative,
        this.#previousDerivativesWrtT,
        this.#sensorData
      )
    }

    initizalizeCurrent(currentState)
    if (Object.keys(previousState).length > 0) {
      initializePrevious(previousState)
      initializeDerivative()
    }
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
    this.#initialize({ ...initialVariableState, ...rawVariableState }, { ...initialVariableState, ...previousRawVariableState })
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

  get stateVector() {
    return Object.values(this).sort()
  }

  every(callback) {
    return Object.entries(this).every(callback)
  }

  mapEntries(mapper) {
    return Object.fromEntries(Object.entries(this).map(mapper))
  }

  mapKeys(mapper) {
    return Object.fromEntries(Object.keys(this).map(mapper))
  }

  isEqual(variable) {
    return Variable.isEqual(this, variable)
  }
}
