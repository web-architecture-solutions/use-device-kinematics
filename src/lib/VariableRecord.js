import Component from './Component'

export default class VariableRecord extends Array {
  constructor(data) {
    super()
    Object.entries(data).forEach((entry, index) => (this[index] = new Component(entry)))
  }
}
