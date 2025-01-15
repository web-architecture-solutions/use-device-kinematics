import { euclideanNorm, toRadians } from '../math'

export default class Variable {
  #previous
  #renameComponent
  #derivativesWrtT
  #deltaT
  #useRadians
  #subclassConstructor

  constructor(currentState, previousState, deltaT, subclassConstructor) {
    this.#renameComponent = subclassConstructor?.renameComponent ?? null
    this.#previous = {}
    this.#deltaT = deltaT
    this.name = subclassConstructor.name
    this.#subclassConstructor = subclassConstructor
    this.#useRadians = subclassConstructor.useRadians

    Object.entries(currentState).forEach(([name, value]) => {
      const componentToBeRenamed = this.#renameComponent && name in this.#renameComponent
      const componentName = componentToBeRenamed ? this.#renameComponent[name] : name
      this[componentName] = this.#useRadians ? toRadians(value) : value
    })

    if (previousState) {
      this.#previous = new this.#subclassConstructor(
        Object.fromEntries(
          Object.entries(previousState).map(([name, value]) => {
            const componentToBeRenamed = this.#renameComponent && name in this.#renameComponent
            const componentName = componentToBeRenamed ? this.#renameComponent[name] : name
            return [componentName, this.#useRadians ? toRadians(value) : value]
          })
        ),
        null,
        deltaT,
        this.#subclassConstructor
      )
    }

    const initializeTotals = (state) => {
      if (this.name !== 'orientation') {
        state.xy = euclideanNorm(state.x, state.y)
        state.xyz = euclideanNorm(state.x, state.y, state.z)
      }
    }
    initializeTotals(this)
    initializeTotals(this.previous)

    if (previousState && Object.keys(previousState).length > 0) {
      this.#derivativesWrtT = new this.#subclassConstructor(
        Object.fromEntries(
          Object.entries(this).map(([name, value]) => {
            const delta = value - this.previous[name]
            return [name, delta / deltaT]
          })
        ),
        null,
        deltaT,
        this.#subclassConstructor
      )
    }
  }

  get deltaT() {
    return this.#deltaT
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
