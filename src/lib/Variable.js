import VariableRecord from './VariableRecord'

export default class Variable {
  #previous
  #renameComponent
  #record

  constructor(currentState, previousState, renameComponent = null) {
    this.#renameComponent = renameComponent
    this.#previous = {}
    this.update(currentState, previousState)
  }

  get previous() {
    return this.#previous
  }

  get record() {
    return this.#record
  }

  static isEqual(variableData1, variableData2) {
    return Object.entries(variableData1).every(([componentName, componentValue]) => {
      return variableData2[componentName] === componentValue
    })
  }

  isEqual(variable) {
    return Variable.isEqual(this, variable)
  }

  _update(variableState, stateObject) {
    Object.entries(variableState).forEach(([name, value]) => {
      const componentToBeRenamed = this.#renameComponent && name in this.#renameComponent
      const componentName = componentToBeRenamed ? this.#renameComponent[name] : name
      stateObject[componentName] = value
    })
  }

  update(currentState, previousState) {
    this._update(currentState, this)
    this._update(previousState, this.#previous)
  }
}
