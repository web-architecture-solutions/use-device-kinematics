import { euclideanNorm, toRadians } from '../math'

export default class Variable {
  #previous
  #derivativesWrtT
  #deltaT
  #derivativeName
  #name

  constructor(currentState, previousState, deltaT, name, subclassConstructor) {
    this.#previous = {}
    this.#deltaT = deltaT
    this.#derivativeName = subclassConstructor.derivativeName
    const renameComponent = subclassConstructor?.renameComponent ?? null

    Object.entries(currentState).forEach(([name, value]) => {
      const componentToBeRenamed = renameComponent && name in renameComponent
      const componentName = componentToBeRenamed ? renameComponent[name] : name
      this[componentName] = subclassConstructor.useRadians ? toRadians(value) : value
    })

    if (previousState) {
      this.#previous = new subclassConstructor(
        Object.fromEntries(
          Object.entries(previousState).map(([name, value]) => {
            const componentToBeRenamed = renameComponent && name in renameComponent
            const componentName = componentToBeRenamed ? renameComponent[name] : name
            return [componentName, subclassConstructor.useRadians ? toRadians(value) : value]
          })
        ),
        null,
        deltaT,
        name,
        subclassConstructor
      )
    }

    const initializeTotals = (state) => {
      state.xy = euclideanNorm(state.x, state.y)
      state.xyz = euclideanNorm(state.x, state.y, state.z)
    }
    initializeTotals(this)

    if (previousState && Object.keys(previousState).length > 0) {
      initializeTotals(this.previous)

      this.#derivativesWrtT = new Variable(
        Object.fromEntries(
          Object.entries(this).map(([name, value]) => {
            const delta = value - this.previous[name]
            return [name, delta / deltaT]
          })
        ),
        null,
        deltaT,
        subclassConstructor.derivativeName,
        subclassConstructor
      )
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
