import VariableRecord from './VariableRecord'

export default class Variable {
  #previous

  constructor(current, previous) {
    Object.entries(current).forEach(([key, value]) => (this[key] = value))

    this.#previous = previous
  }

  get previous() {
    return this.#previous
  }

  get record() {
    return new VariableRecord(this)
  }

  get previousRecord() {
    return new VariableRecord(this.previous)
  }

  isEqual(variable) {
    return Object.entries(this).every(([componentName, componentValue]) => {
      return variable[componentName] === componentValue
    })
  }

  renameComponents(renameMap) {
    if (!this.previous) return this
    const componentToRenamedComponent = (component) => {
      return component.rename(component.name in renameMap ? renameMap[component.name] : component.name)
    }
    const _renameComponents = (components) => Object.fromEntries(components.map(componentToRenamedComponent))
    return new Variable(_renameComponents(this.record), _renameComponents(this.previousRecord))
  }
}
