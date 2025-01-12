export default class Variable {
  constructor(data) {
    Object.entries(data).forEach(([key, value]) => (this[key] = value))
  }

  renameComponents(renameMap) {
    const { previous, ...current } = this
    if (!current || !previous) return this
    const componentToRenamedComponent = ([componentName, componentValue]) => {
      const newComponentName = componentName in renameMap ? renameMap[componentName] : componentName
      return [newComponentName, componentValue]
    }
    const _renameComponents = (components) => Object.fromEntries(Object.entries(components).map(componentToRenamedComponent))
    return { ..._renameComponents(current), previous: _renameComponents(previous) }
  }
}
