export default class Component extends Array {
  constructor([name, value]) {
    super()

    this[0] = name
    this[1] = value
  }

  get name() {
    return this[0]
  }

  rename(name) {
    this[0] = name
    return this
  }
}
