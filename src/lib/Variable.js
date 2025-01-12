import VariableRecord from './VariableRecord'

export default class Variable {
  constructor(data) {
    Object.entries(data).forEach(([key, value]) => (this[key] = value))
  }

  get current() {
    const { previous: _, ...current } = this
    return current
  }

  get currentRecord() {
    return new VariableRecord(this.current)
  }

  get previousRecord() {
    return new VariableRecord(this.previous)
  }

  renameComponents(renameMap) {
    if (!this.current || !this.previous) return this
    const componentToRenamedComponent = (component) => {
      return component.rename(component.name in renameMap ? renameMap[component.name] : component.name)
    }
    const _renameComponents = (components) => Object.fromEntries(components.map(componentToRenamedComponent))
    return new Variable({ ..._renameComponents(this.currentRecord), previous: _renameComponents(this.previousRecord) })
  }
}
