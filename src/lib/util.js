export function remap(variable, _remap) {
  const toNewComponentName = ([componentName, componentValue]) => [_remap[componentName], componentValue]
  const remapComponents = (components) => Object.fromEntries(Object.entries(components).map(toNewComponentName))
  const { previous, ...current } = variable
  if (current && previous) {
    return { ...remapComponents(current), previous: remapComponents(previous) }
  }
  return {}
}
