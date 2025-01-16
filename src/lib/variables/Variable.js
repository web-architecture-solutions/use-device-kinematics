import { toRadians } from '../math'

export default class Variable {
  #previous
  #derivativesWrtT
  #derivativeName
  #renameComponents
  #useRadians

  constructor(rawVariableState, previousRawVariableState, previousDerivativesWrtT, subclassConstructor, sensorData) {
    this.#previous = {}
    this.#useRadians = subclassConstructor?.useRadians
    this.#renameComponents = subclassConstructor?.renameComponents ?? null
    this.#derivativeName = subclassConstructor?.derivative?.name

    const timestamp = sensorData?.timestamp ?? null
    const previousTimestamp = sensorData?.previousTimestamp ?? null
    const deltaT = timestamp - previousTimestamp

    const initialVariableState = subclassConstructor?.initial ?? {}
    const currentState = { ...initialVariableState, ...rawVariableState }
    const previousState = { ...initialVariableState, ...previousRawVariableState }

    this.#initizalize(currentState, (componentName, value) => {
      this[componentName] = this.conditionallyTransformAngularValue(value)
    })

    if (previousState && Object.keys(previousState).length > 0) {
      const initializedPreviousState = Object.fromEntries(
        this.#initizalize(previousState, (componentName, value) => {
          return [componentName, this.conditionallyTransformAngularValue(value)]
        })
      )

      this.#previous = new subclassConstructor(initializedPreviousState, null, subclassConstructor, sensorData)

      const initializeComponentDerivative = ([name, value]) => {
        const delta = value - this.previous[name]
        return [name, delta / deltaT]
      }
      const derivativesWrtT = Object.fromEntries(Object.entries(this).map(initializeComponentDerivative))
      this.#derivativesWrtT = subclassConstructor.derivative
        ? new subclassConstructor.derivative(derivativesWrtT, previousDerivativesWrtT, {}, subclassConstructor.derivative, sensorData)
        : {}
    }

    this.name = subclassConstructor.name
  }

  static isEqual(variableData1, variableData2) {
    return Object.entries(variableData1).every(([componentName, componentValue]) => {
      return variableData2?.[componentName] === componentValue
    })
  }

  get hasDerivative() {
    return this.#derivativeName ? true : false
  }

  get derivativeName() {
    return this.#derivativeName
  }

  get previous() {
    return this.#previous
  }

  get derivativeName() {
    return this.#derivativeName
  }

  get derivativesWrtT() {
    return this.#derivativesWrtT
  }

  get stateVector() {
    return Object.values(this).sort()
  }

  #initizalize(state, callback) {
    return Object.entries(state).map(([name, value]) => {
      const shouldComponentBeRenamed = this.#renameComponents && name in this.#renameComponents
      const componentName = shouldComponentBeRenamed ? this.#renameComponents[name] : name
      return callback(componentName, value)
    })
  }

  conditionallyTransformAngularValue(value) {
    return this.#useRadians ? toRadians(value) : value
  }

  isEqual(variable) {
    return Variable.isEqual(this, variable)
  }
}
