export default class Variable {
  #previous
  #renameComponent
  #record
  #derivativesWrtT
  #deltaT

  constructor(currentState, previousState, deltaT, renameComponent = null) {
    this.#renameComponent = renameComponent
    this.#previous = {}
    this.#derivativesWrtT = {}
    this.#deltaT = deltaT

    const initializeWith = (stateObject, variableState) => {
      Object.entries(variableState).forEach(([name, value]) => {
        const componentToBeRenamed = this.#renameComponent && name in this.#renameComponent
        const componentName = componentToBeRenamed ? this.#renameComponent[name] : name
        stateObject[componentName] = value
      })
    }

    initializeWith(this, currentState)
    initializeWith(this.#previous, previousState)

    if (previousState && Object.keys(previousState).length > 0) {
      this.#derivativesWrtT = Object.fromEntries(
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

  get derivativesWrt() {
    return this.#derivativesWrtT
  }

  set derivativesWrt(_derivativesWrt) {
    this.#derivativesWrtT = derivativesWrt
  }

  get record() {
    return this.#record
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
