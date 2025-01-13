export default class Component extends Array {
  //#previous

  constructor([name, value], previous) {
    super()

    this[0] = name
    this[1] = value

    //this.#previous = previous
  }

  get name() {
    return this[0]
  }

  get value() {
    return this[1]
  }

  isEqual([name, value]) {
    return this.name === name && this.value === value
  }
}
