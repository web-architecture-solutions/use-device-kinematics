import { euclideanNorm, toRadians } from '../math'

export default class Variable {
  #previous
  #renameComponent
  #derivativesWrtT
  #deltaT

  constructor(currentState, previousState, deltaT, renameComponent = null) {
    this.#renameComponent = renameComponent
    this.#previous = {}
    this.#deltaT = deltaT

    const initializeComponents = (target, source) => {
      Object.entries(source).forEach(([name, value]) => {
        const componentToBeRenamed = this.#renameComponent && name in this.#renameComponent
        const componentName = componentToBeRenamed ? this.#renameComponent[name] : name
        target[componentName] = this.constructor.useRadians ? toRadians(value) : value
      })
    }

    const initializeTotals = (state) => {
      state.xy = euclideanNorm(state.x, state.y)
      state.xyz = euclideanNorm(state.x, state.y, state.z)
    }

    initializeComponents(this, currentState)
    initializeComponents(this.#previous, previousState)
    initializeTotals(this)
    initializeTotals(this.previous)

    if (previousState && Object.keys(previousState).length > 0) {
      this.derivativesWrtT = Object.fromEntries(
        Object.entries(this).map(([name, value]) => {
          const delta = value - this.previous[name]
          return [name, delta / deltaT]
        })
      )
    }
  }

  get deltaT() {
    return this.#deltaT
  }

  get previous() {
    return this.#previous
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
