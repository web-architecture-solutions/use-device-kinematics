import VariableRecord from './VariableRecord'

export default class Variable {
  #previous
  #renameComponent
  #record

  constructor(currentState, previousState, renameComponent = null) {
    this.#renameComponent = renameComponent
    this.#record = new VariableRecord(currentState)
    this.update(currentState, previousState)
  }

  get previous() {
    return this.#previous
  }

  get record() {
    return this.#record
  }

  isEqual(variable) {
    return Object.entries(this).every(([componentName, componentValue]) => {
      return variable[componentName] === componentValue
    })
  }

  update(currentState, previousState) {
    new VariableRecord(currentState).forEach((component) => {
      const componentToBeRenamed = this.#renameComponent && component.name in this.#renameComponent
      const componentName = componentToBeRenamed ? this.#renameComponent[component.name] : component.name
      this[componentName] = component.value
    })
    this.#record.update(currentState)
    this.#previous = previousState
  }
}
