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

  set name(_name) {
    this[0] = _name
  }

  get value() {
    return this[1]
  }

  set value(_value) {
    this[1] = _value
  }

  update([name, value]) {
    this.name = name
    this.value = value
  }

  isEqual([name, value]) {
    return this.name === name && this.value === value
  }
}
