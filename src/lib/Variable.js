import VariableRecord from './VariableRecord'

export default class Variable {
  #previous
  #renameComponent

  constructor(current, previous, renameComponent = null) {
    this.#renameComponent = renameComponent
    this.update(current, previous)
  }

  get previous() {
    return this.#previous
  }

  get record() {
    return new VariableRecord(this)
  }

  isEqual(variable) {
    return Object.entries(this).every(([componentName, componentValue]) => {
      return variable[componentName] === componentValue
    })
  }

  update(current, previous) {
    new VariableRecord(current).forEach((component) => {
      const componentToBeRenamed = this.#renameComponent && component.name in this.#renameComponent
      const componentName = componentToBeRenamed ? this.#renameComponent[component.name] : component.name
      this[componentName] = component.value
    })
    this.#previous = previous
  }
}
