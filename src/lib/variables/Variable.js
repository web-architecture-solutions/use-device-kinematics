import { euclideanNorm, toRadians } from '../math'

export default class Variable {
  #previous
  #derivativesWrtT
  #derivativeName
  #renameComponents
  #useRadians

  constructor(name, rawVariableState, previousRawVariableState, previousDerivativesWrtT, subclassConstructor, sensorData) {
    this.#previous = {}
    this.#derivativeName = subclassConstructor?.derivativeName ?? null
    this.#useRadians = subclassConstructor?.useRadians
    this.#renameComponents = subclassConstructor?.renameComponents ?? null

    const timestamp = sensorData?.timestamp ?? null
    const previousTimestamp = sensorData?.previousTimestamp ?? null
    const deltaT = timestamp - previousTimestamp

    const initialVariableState = subclassConstructor?.initial ?? {}
    const currentState = { ...initialVariableState, ...rawVariableState }
    const previousState = { ...initialVariableState, ...previousRawVariableState }

    this.#initizalize(currentState, (componentName, value) => {
      this[componentName] = this.conditionallyTransformAngularValue(value)
    })

    /*
    const initializeTotals = (state) => {
      state.xy = euclideanNorm(state.x, state.y)
      state.xyz = euclideanNorm(state.x, state.y, state.z)
    }
    initializeTotals(this)
    */

    if (previousState && Object.keys(previousState).length > 0) {
      const initializedPreviousState = Object.fromEntries(
        this.#initizalize(previousState, (componentName, value) => {
          return [componentName, this.conditionallyTransformAngularValue(value)]
        })
      )

      this.#previous = new subclassConstructor(name, initializedPreviousState, null, subclassConstructor, sensorData)
      //initializeTotals(this.previous)

      const initializeComponentDerivative = ([name, value]) => {
        const delta = value - this.previous[name]
        return [name, delta / deltaT]
      }
      const derivativesWrtT = Object.fromEntries(Object.entries(this).map(initializeComponentDerivative))
      this.#derivativesWrtT = new Variable(
        subclassConstructor.derivativeName,
        derivativesWrtT,
        previousDerivativesWrtT,
        subclassConstructor,
        sensorData
      )
    }

    this.name = name
  }

  static isEqual(variableData1, variableData2) {
    return Object.entries(variableData1).every(([componentName, componentValue]) => {
      return variableData2?.[componentName] === componentValue
    })
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
