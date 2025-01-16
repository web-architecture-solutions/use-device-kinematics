import { euclideanNorm, toRadians } from '../math'

export default class Variable {
  #previous
  #derivativesWrtT
  #deltaT
  #derivativeName
  #name

  constructor(currentState, previousState, previousDerivativesWrtT, deltaT, name, subclassConstructor) {
    this.#previous = {}
    this.#deltaT = deltaT
    this.#derivativeName = subclassConstructor?.derivativeName ?? null
    const renameComponent = subclassConstructor?.renameComponent ?? null

    const initizalizeState = (state, callback) => {
      return Object.entries(state).map(([name, value]) => {
        const shouldComponentBeRenamed = renameComponent && name in renameComponent
        const componentName = shouldComponentBeRenamed ? renameComponent[name] : name
        return callback(componentName, value)
      })
    }

    const conditionallyTransformAngularValue = (value) => (subclassConstructor?.useRadians ? toRadians(value) : value)
    const currentStateInitializationCallback = (componentName, value) => (this[componentName] = conditionallyTransformAngularValue(value))
    const previousStateInitializationCallback = (componentName, value) => [componentName, conditionallyTransformAngularValue(value)]

    const initializeDerivative = () => {
      return new Variable(
        Object.fromEntries(
          Object.entries(this).map(([name, value]) => {
            const delta = value - this.previous[name]
            return [name, delta / deltaT]
          })
        ),
        previousDerivativesWrtT,
        deltaT,
        subclassConstructor.derivativeName,
        subclassConstructor
      )
    }

    initizalizeState(currentState, currentStateInitializationCallback)

    const initializeTotals = (state) => {
      state.xy = euclideanNorm(state.x, state.y)
      state.xyz = euclideanNorm(state.x, state.y, state.z)
    }
    initializeTotals(this)

    if (previousState && Object.keys(previousState).length > 0) {
      const initializedPreviousState = Object.fromEntries(initizalizeState(previousState, previousStateInitializationCallback))
      this.#previous = new subclassConstructor(initializedPreviousState, null, deltaT, name, subclassConstructor)
      initializeTotals(this.previous)

      this.#derivativesWrtT = initializeDerivative()
    }

    this.#name = name
  }

  get name() {
    return this.#name
  }

  get deltaT() {
    return this.#deltaT
  }

  get derivativeName() {
    return this.#derivativeName
  }

  get previous() {
    return this.#previous
  }

  get derivativesWrtT() {
    return this.#derivativesWrtT
  }

  static isEqual(variableData1, variableData2) {
    return Object.entries(variableData1).every(([componentName, componentValue]) => {
      return variableData2?.[componentName] === componentValue
    })
  }

  isEqual(variable) {
    return Variable.isEqual(this, variable)
  }
}
